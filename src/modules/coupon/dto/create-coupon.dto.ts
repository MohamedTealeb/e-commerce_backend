import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";
import { CouponType } from "src/common/enums/coupon.enum";
import { ICoupon } from "src/common/interfaces/coupon.interface";

export class CreateCouponDto implements Partial<ICoupon> {

@Type(()=>Number)
@IsPositive()
@IsNumber()
discount: number
@Type(()=>Number)
@IsPositive()
@IsNumber()
duration: number 
@IsDateString()
startDate: Date 
@IsDateString()
endDate: Date 
@IsEnum(CouponType)
type: CouponType 
@IsString()
@IsNotEmpty()
name: string 



}
