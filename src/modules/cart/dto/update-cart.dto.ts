import { PartialType } from '@nestjs/mapped-types';
import { CreateCartDto } from './create-cart.dto';
import { Types } from 'mongoose';
import { MongoDBIds } from 'src/common/decoretors/match.custom.decoretor';
import { Validate, IsArray, ValidateNested, IsOptional, IsNumber, Min, IsPositive, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class RemoveCartItem {
    @IsMongoId()
    productId: Types.ObjectId;
    
    @IsOptional()
    @IsNumber()
    @Min(1)
    @IsPositive()
    quantity?: number;
}

export class RemoveItemCartDto  {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RemoveCartItem)
    items: RemoveCartItem[];
}
export class UpdateCartDto extends PartialType(CreateCartDto) {}