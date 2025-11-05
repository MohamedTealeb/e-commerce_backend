import { Types } from "mongoose";
import { IUser } from "./user.interfaces";
import { CouponType } from "../enums/coupon.enum";


export interface ICoupon {
    _id?:Types.ObjectId,
    name: string;
    slug: string;
    image: string;


    createdBy: Types.ObjectId | IUser;
    updatedBy?:Types.ObjectId | IUser
    usedBy?:Types.ObjectId[] | IUser[]
    duration:number
    discount:number
    type:CouponType

    startDate:Date
    endDate:Date

    freezedAt?:Date
    restoredAt?:Date





    createdAt?: Date;
    updatedAt?: Date;
}

