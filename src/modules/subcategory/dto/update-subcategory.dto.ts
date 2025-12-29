import { IsMongoId, IsNotEmpty } from "class-validator";
import { Types } from "mongoose";

export class UpdateSubcategoryParamsDto {
  @IsMongoId()
  categoryId: Types.ObjectId;

  @IsMongoId()
  subcategoryId: Types.ObjectId;
}

export class UpdateSubcategoryDto {
  @IsMongoId()
  @IsNotEmpty()
  newSubcategoryId: string;
}