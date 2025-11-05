import { Types } from "mongoose";
import { IProduct } from "./product.interface";
import { OrderStatusName, PaymentType } from "../enums/payment.enums";
import { IUser } from "./user.interfaces";
import { OrderStatus } from 'src/common/enums/payment.enums';
import { ICoupon } from "./coupon.interface";

export interface IOrderProduct {
    _id?:Types.ObjectId,
    productId:Types.ObjectId | IProduct,
    name:string,
    quantity:number,
    unitPrice:number,
    finalPrice:number,

    createdAt?:Date,
    updatedAt?:Date,

}


export interface IOrder {
    _id?:Types.ObjectId,
    orderId:string,
    address:string,
    phone:string,
    note?:string,
    products:IOrderProduct[],
    subTotal:number,
    discount?:number,
    total:number,
    paymentType:PaymentType,
    status:OrderStatus,
    cancelReason?:string,

coupon?:Types.ObjectId | ICoupon,
intentId?:string,



    createdAt?:Date,
    updatedAt?:Date,
  paidAt?:Date,
  paymentIntent?:string,
    freezedAt?:Date,
    restoredAt?:Date,
    updatedBy?:Types.ObjectId | IUser,
    createdBy:Types.ObjectId | IUser,
}