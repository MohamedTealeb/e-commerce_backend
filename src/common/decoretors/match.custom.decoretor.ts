
import{ registerDecorator, Validate, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { Types } from "mongoose";


@ValidatorConstraint({name:"match_between_fields", async:false})
export class MongoDBIds implements ValidatorConstraintInterface {
    validate(ids: any, args: ValidationArguments){
      const values = Array.isArray(ids) ? ids : [ids];
      for (let raw of values) {
        let value: any = raw;
        if (value && typeof value === 'object' && value._id) {
          value = value._id;
        }
        if (typeof value === 'string') {
          value = value.trim();
          if (!/^[a-fA-F0-9]{24}$/.test(value)) {
            return false;
          }
        }
        if (!Types.ObjectId.isValid(value)) {
          return false;
        }
      }
      return true;
    }
    defaultMessage(validationArguments?: ValidationArguments): string {
        return 'invalid brandIds format';
    }
}
@ValidatorConstraint({name:"match_between_fields", async:false})
export class MatchBetween implements ValidatorConstraintInterface {
    validate(value:any, args:ValidationArguments){
        console.log({value,args,matchWith:args.constraints[0],matchWithValue:args.object[args.constraints[0]]});
            return value===args.object[args.constraints[0]];
    }
    defaultMessage(validationArguments?: ValidationArguments): string {
        return 'Passwords do not match';
    }
}
export function IsMatch(constraints: string[], validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints,
      validator: MatchBetween,
    });
  };
}
