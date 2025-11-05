import { Injectable } from "@nestjs/common";
import { DataBaseRepository } from "./database.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Brand, BrandDocument,  } from "../model/brand.model";
import { Model } from "mongoose";



@Injectable()
export class BrandRepository extends DataBaseRepository<Brand>{
    constructor(@InjectModel(Brand.name) protected  readonly model:Model<BrandDocument>){
        super(model)
    }
}