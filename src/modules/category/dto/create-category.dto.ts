import { IsBoolean, IsOptional, IsString, MaxLength, MinLength, Validate } from "class-validator"
import { Transform } from "class-transformer"
import { Types } from "mongoose"
import { MongoDBIds } from "src/common/decoretors/match.custom.decoretor"
import { IBrand } from "src/common/interfaces/brand.interface"
import { ICategory } from "src/common/interfaces/category.interface"

export class CreateCategoryDto implements Partial<ICategory> {
    @MaxLength(26)
    @MinLength(2)
    @IsString()
    name:string

@MaxLength(5000)
@MinLength(2)
@IsString()
@IsOptional()
description?: string 

@Validate(MongoDBIds)
@IsOptional()
brands:Types.ObjectId[] | IBrand[]

@IsBoolean()
@IsOptional()
@Transform(({ value }) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return undefined;
})
hasSubcategories?: boolean

}
