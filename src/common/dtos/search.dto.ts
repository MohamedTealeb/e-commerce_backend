import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, IsString } from "class-validator";



export class SearchDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
    @IsOptional()
    page:number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  size:number;

  @IsString()
  @IsOptional()
  search:string;
}