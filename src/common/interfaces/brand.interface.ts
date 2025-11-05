import { Types } from "mongoose";
import { IUser } from "./user.interfaces";


export interface IBrand {

    _id?:Types.ObjectId
    name:string
    slogan:string
    image:string
    createdBy:Types.ObjectId | IUser
    category?: Types.ObjectId
    createdAt?:Date
    updatedAt?:Date
    updatedBy?:Types.ObjectId | IUser
    freezedAt?:Date
    restoredAt?:Date



}