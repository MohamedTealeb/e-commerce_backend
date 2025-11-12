import { Type, Transform } from "class-transformer";
import { IsMongoId, IsNumber, IsOptional, IsPositive, IsString, Length, IsArray } from "class-validator";
import { Types } from "mongoose";

import { IProduct } from "src/common/interfaces/product.interface";

export class CreateProductDto implements Partial<IProduct> {
     @IsMongoId()
    @IsOptional()
    brand: Types.ObjectId 
    @IsMongoId()
    category: Types.ObjectId 
    @Length(2,5000)
    @IsString()
    @IsOptional()
    description: string ;
    @Length(2,2226)
    @IsString()
    @IsOptional()
    name: string ;
    @Type(()=>Number)
    @IsPositive()

    @IsOptional()
    discountPercent: number ;
    
    @IsPositive()
    @Type(()=>Number)
    originalPrice: number 
   

    @IsPositive()
    @Type(()=>Number)
    stock?: number ;

    @IsOptional()
    @Transform(({ value }) => {
      if (!value) return undefined;
      // If it's already an array or object, return as is
      if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        return value;
      }
      // If it's a string (from form-data), try to parse it
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          // Can be array or object - both are valid
          return parsed;
        } catch (e) {
          return undefined;
        }
      }
      return value;
    })
    variants?: IProduct["variants"] | (IProduct["variants"] extends Array<infer U> ? U : never)

} 
