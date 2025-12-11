import { IsBoolean, IsOptional, IsString, MaxLength, MinLength, Validate } from "class-validator"
import { Transform } from "class-transformer"
import { Types } from "mongoose"
import { MongoDBIds } from "src/common/decoretors/match.custom.decoretor"
import { IBrand } from "src/common/interfaces/brand.interface"
import { ICategory } from "src/common/interfaces/category.interface"

export const toArrayOrValue = (value: any) => {
  if (value === '' || value === null || value === undefined) return undefined;
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fallthrough to comma/solo handling
    }
    if (value.includes(',')) return value.split(',').map((v) => v.trim()).filter(Boolean);
    return [value];
  }
  return value;
};

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
@Transform(({ value }) => toArrayOrValue(value))
@Transform(({ value }) => {
  if (value === '' || value === null || value === undefined) return undefined;
  return value;
})
brands:Types.ObjectId[] | IBrand[]

@IsBoolean()
@IsOptional()
@Transform(({ value }) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return undefined;
})
hasSubcategories?: boolean

@Validate(MongoDBIds)
@IsOptional()
@Transform(({ value }) => toArrayOrValue(value))
subcategories?: Types.ObjectId[]

}
