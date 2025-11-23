// import { PartialType } from '@nestjs/mapped-types';
// import { CreateProductDto } from './create-product.dto';

import { PartialType } from "@nestjs/mapped-types";
import { IsArray, IsMongoId, IsOptional, IsBoolean } from "class-validator";
import { Transform } from "class-transformer";
import { Types } from "mongoose";
import { containField } from "src/common/decoretors/update.decorator";
import { CreateProductDto } from "./create-product.dto";
@containField()
export class UpdateProductDto extends PartialType(CreateProductDto)  {
       @Transform(({ value }) => {
         if (!value) return undefined;
         // If it's already an array, return as is
         if (Array.isArray(value)) {
           return value;
         }
         // If it's a string (from form-data), try to parse it
         if (typeof value === 'string') {
           try {
             const parsed = JSON.parse(value);
             return Array.isArray(parsed) ? parsed : [parsed];
           } catch (e) {
             // If parsing fails, treat as single value
             return [value];
           }
         }
         // If it's a single value, wrap it in array
         return [value];
       })
       @IsArray()
       @IsOptional()
    removedAttachments?:string[]
    
    @IsBoolean()
    @IsOptional()
    __hasFiles?: boolean
}


export class ProductParamsDto{
    @IsMongoId()
    productId:Types.ObjectId
}