import { Types } from "mongoose";
import { IUser } from "./user.interfaces";
import { otpEnum } from "../enums/otp.enum";


export interface IOtp {

_id?:Types.ObjectId,
code:string,
expiredAt:Date,
type:otpEnum,
createdBy:Types.ObjectId,
createdAt?:Date,
updatedAt?:Date,

}