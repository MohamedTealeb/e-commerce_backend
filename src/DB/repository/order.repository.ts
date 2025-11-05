import { Injectable } from "@nestjs/common";
import { DataBaseRepository } from "./database.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Brand, BrandDocument,  } from "../model/brand.model";
import { Model } from "mongoose";
import { Order, OrderDocument } from "../model/oreder.model";



@Injectable()
export class OrderRepository extends DataBaseRepository<Order>{
    constructor(@InjectModel(Order.name) protected  readonly model:Model<OrderDocument>){
        super(model)
    }
}