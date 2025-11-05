import { PartialType } from '@nestjs/mapped-types';
import { CreateCouponDto } from './create-coupon.dto';
import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';
import { Transform } from 'class-transformer';

export class UpdateCouponDto extends PartialType(CreateCouponDto) {}

export class CouponParamsDto {
    @IsMongoId()
    id:Types.ObjectId
}
