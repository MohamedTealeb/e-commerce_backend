// import { PartialType } from '@nestjs/mapped-types';
// import { CreateProductDto } from './create-product.dto';

import { PartialType } from "@nestjs/mapped-types";
import { IsArray, IsMongoId, IsOptional, IsBoolean } from "class-validator";
import { Types } from "mongoose";
import { containField } from "src/common/decoretors/update.decorator";
import { CreateProductDto } from "./create-product.dto";
@containField()
export class UpdateProductDto extends PartialType(CreateProductDto)  {
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