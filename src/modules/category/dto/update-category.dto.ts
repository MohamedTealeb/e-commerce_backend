import { PartialType } from '@nestjs/mapped-types';

import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Validate } from "class-validator";
import { Types } from "mongoose";
import { containField } from 'src/common/decoretors/update.decorator';
import { Type } from 'class-transformer';
import { CreateCategoryDto } from './create-category.dto';
import { IBrand } from 'src/common/interfaces/brand.interface';
import { MongoDBIds } from 'src/common/decoretors/match.custom.decoretor';
@containField()
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    @Validate(MongoDBIds)
    @IsOptional()
    removeBrands:Types.ObjectId[] | IBrand[]
}

export class CategoryParamsDto {
    @IsMongoId()
    categoryId:Types.ObjectId
}


export class GetAllDto {
@Type(() => Number)
@IsNumber()
@IsPositive()
@IsOptional()
page:number
@Type(() => Number)
@IsNumber()
@IsPositive()
@IsOptional()
size:number
@IsNotEmpty()
@IsString()
@IsOptional()
search:string

}