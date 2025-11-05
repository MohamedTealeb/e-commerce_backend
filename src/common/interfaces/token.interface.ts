import type { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { UserDocument } from "src/DB/model/user.model";
import { TokenEnum } from "../enums/token.enums";
import { IUser } from "./user.interfaces";

export interface IToken{
    _id?:Types.ObjectId,
    jti:string,
    expiresAt:Date,
    createdBy:Types.ObjectId | IUser,
    createdAt?:Date,
    updatedAt?:Date,
}
export interface ICredentials{ 
    user:UserDocument,
    decode:JwtPayload
}
export interface IAuthRequest extends Request {

    credentials:ICredentials;
    tokenType?:TokenEnum
}