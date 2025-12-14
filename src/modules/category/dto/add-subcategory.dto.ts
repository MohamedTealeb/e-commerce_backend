import { IsNotEmpty, Validate } from "class-validator";
import { Transform } from "class-transformer";
import { Types } from "mongoose";
import { MongoDBIds } from "src/common/decoretors/match.custom.decoretor";
import { toArrayOrValue } from "./create-category.dto";

export class AddSubcategoryDto {
  @Validate(MongoDBIds)
  @IsNotEmpty()
  @Transform(({ value }) => toArrayOrValue(value))
  subcategoryIds: Types.ObjectId[] | string[];
}
