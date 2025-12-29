import { IsNotEmpty, IsMongoId, Validate } from "class-validator";
import { Transform } from "class-transformer";
import { Types } from "mongoose";
import { MongoDBIds } from "src/common/decoretors/match.custom.decoretor";
import { toArrayOrValue } from "src/modules/category/dto/create-category.dto";

export class AddSubcategoryDto {
  @Validate(MongoDBIds)
  @IsNotEmpty()
  @Transform(({ value }) => toArrayOrValue(value))
  subcategoryIds: Types.ObjectId[] | string[];
}

export class AddSubcategoryParamsDto {
  @IsMongoId()
  categoryId: Types.ObjectId;
}

export class SubcategoryParamsDto {
  @IsMongoId()
  categoryId: Types.ObjectId;

  @IsMongoId()
  subcategoryId: Types.ObjectId;
}