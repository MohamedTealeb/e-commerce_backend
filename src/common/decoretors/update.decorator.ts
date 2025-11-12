

import{ registerDecorator, Validate, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";


@ValidatorConstraint({name:"check_fields-Exist", async:true})
export class   CheckIfAnyFieldAreApplied  implements ValidatorConstraintInterface {
    validate(value:any, args:ValidationArguments){
        // Check if there are any fields in the body (excluding undefined values)
        const hasBodyFields = Object.keys(args.object).length > 0 && 
            Object.values(args.object).filter((arg) => arg !== undefined).length > 0;
        
        // Also check if there's a special flag indicating files were uploaded
        // This allows the controller to set a flag when files are present
        const hasFilesFlag = (args.object as any).__hasFiles === true;
        
        return hasBodyFields || hasFilesFlag;
    }
    defaultMessage(validationArguments?: ValidationArguments): string {
        return 'All update fields are empty';
    }
}
export function containField( validationOptions?: ValidationOptions) {
  return function (constructor:Function) {
    registerDecorator({
      target:constructor,
      propertyName:undefined!,
      options: validationOptions,
      constraints:[],

      validator: CheckIfAnyFieldAreApplied,
    });
  };
}