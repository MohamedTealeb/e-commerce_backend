import { Injectable } from "@nestjs/common";
import { DataBaseRepository } from "./database.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Cart, CartDocument } from "../model/cart.model";



@Injectable()
export class CartRepository extends DataBaseRepository<Cart>{
    constructor(@InjectModel(Cart.name) protected  readonly model:Model<CartDocument>){
        super(model)
    }
}