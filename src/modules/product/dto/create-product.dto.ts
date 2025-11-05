import { Type } from "class-transformer";
import { IsMongoId, IsNumber, IsOptional, IsPositive, IsString, Length } from "class-validator";
import { Types } from "mongoose";

import { IProduct } from "src/common/interfaces/product.interface";

export class CreateProductDto implements Partial<IProduct> {
     @IsMongoId()
    brand: Types.ObjectId 
    @IsMongoId()
    category: Types.ObjectId 
    @Length(2,5000)
    @IsString()
    @IsOptional()
    description: string ;
    @Length(2,2226)
    @IsString()
    @IsOptional()
    name: string ;
    @Type(()=>Number)
    @IsPositive()

    @IsOptional()
    discountPercent: number ;
    
    @IsPositive()
    @Type(()=>Number)
    originalPrice: number 
   

    @IsPositive()
    @Type(()=>Number)
    stock?: number ;

    @IsOptional()
    variants?: IProduct["variants"]

}
