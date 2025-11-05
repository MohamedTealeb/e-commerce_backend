import { Injectable } from "@nestjs/common";
import { DataBaseRepository } from "./database.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Product, ProductDocument } from "../model/product.model";



@Injectable()
export class ProductRepository extends DataBaseRepository<Product>{
    constructor(@InjectModel(Product.name) protected  readonly model:Model<ProductDocument>){
        super(model)
    }
}