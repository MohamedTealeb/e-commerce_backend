import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, HydratedDocument } from "mongoose";
import { User } from "./user.model";
import { IToken } from "src/common/interfaces/token.interface";


@Schema({
    timestamps:true,
})
export class Token  implements IToken{
    @Prop({type:String,required:true,unique:true})
    jti:string




    @Prop({type:Date,required:true})
    expiresAt:Date

    @Prop({type:Types.ObjectId,required:true,unique:true,ref:'User'})
    createdBy:Types.ObjectId
}
export const TokenSchema = SchemaFactory.createForClass(Token);
export type TokenDocument = HydratedDocument<Token>;
export const TokenModel=MongooseModule.forFeature([{name:Token.name,schema:TokenSchema}])