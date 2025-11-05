import { Injectable } from "@nestjs/common";
import { DataBaseRepository } from "./database.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Category, CategoryDocument } from "../model/category.model";



@Injectable()
export class CategoryRepository extends DataBaseRepository<Category>{
    constructor(@InjectModel(Category.name) protected  readonly model:Model<CategoryDocument>){
        super(model)
    }
}