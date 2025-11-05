import { InjectModel } from "@nestjs/mongoose";
import { DataBaseRepository } from "./database.repository";
import { Token, TokenDocument } from "../model/token.model";
import { Model } from "mongoose";



export class TokenRepository extends DataBaseRepository<Token, TokenDocument>{
    constructor(@InjectModel(Token.name) protected override readonly model:Model<TokenDocument>){
        super(model)
    }
}