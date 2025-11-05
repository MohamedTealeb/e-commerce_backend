import { Types } from "mongoose";
import { GenderEnum, LanguageEnum, ProviderEnum, RoleEnum } from "../enums/user.enum";
import { OtpDocument } from "src/DB/model/otp.model";
import { IProduct } from "./product.interface";

export interface IUser {

    _id?:Types.ObjectId,
    firstName:string,
    lastName:string,
    username?:string,
    email:string,
    confirmedAt?:Date,
    confirmEmail?:Date,
    changeCredentials?:Date,
    password?:string,
    confirmPassword:string,
    otp?:OtpDocument[],
    role:RoleEnum,
    preferredLanguage:LanguageEnum,
    profilePicture?:string,
    provider:ProviderEnum,
    gender:GenderEnum,
    createdAt:Date,
    updatedAt:Date,
    wishlist?:Types.ObjectId[] | IProduct[],

}
