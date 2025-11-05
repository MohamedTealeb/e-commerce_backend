import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";
import { Types } from "mongoose";
import { PaymentType } from "src/common/enums/payment.enums";
import { ICoupon } from "src/common/interfaces/coupon.interface";
import { IOrder } from "src/common/interfaces/order.interface";

export class CreateOrderDto implements Partial<IOrder> {
    @IsString()
    @IsNotEmpty()
    @IsString()
    address: string
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    note: string 
    @Matches(/^(002|\+2)?01[0125][0-9]{8}$/)
    phone: string 
    @IsEnum(PaymentType)
    paymentType: PaymentType 

    @IsMongoId()
    @IsOptional()
    coupon: Types.ObjectId | ICoupon ;

    
}

export class OrderParamDto {
@IsMongoId()
orderId:Types.ObjectId 


}