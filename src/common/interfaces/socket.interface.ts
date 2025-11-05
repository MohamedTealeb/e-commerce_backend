import { JwtPayload } from "jsonwebtoken";
import { Socket } from "socket.io";
import { UserDocument } from "src/DB/model/user.model";


export interface ISocket extends Socket {
 credentials:{
    user:UserDocument,
    decode:JwtPayload
 }
}