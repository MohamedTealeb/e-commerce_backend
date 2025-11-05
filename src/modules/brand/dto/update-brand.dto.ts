import { PartialType } from '@nestjs/mapped-types';
import { CreateBrandDto } from './create-brand.dto';

import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";
import { Types } from "mongoose";
import { containField } from 'src/common/decoretors/update.decorator';
import { Type } from 'class-transformer';
@containField()
export class UpdateBrandDto extends PartialType(CreateBrandDto) {}

export class BrandParamsDto {
    @IsMongoId()
    brandId:Types.ObjectId
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