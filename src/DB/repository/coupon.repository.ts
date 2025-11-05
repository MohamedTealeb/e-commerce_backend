import { Injectable } from "@nestjs/common";
import { DataBaseRepository } from "./database.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Coupon, CouponDocument } from "../model/coupon.model";



@Injectable()
export class CouponRepository extends DataBaseRepository<Coupon>{
    constructor(@InjectModel(Coupon.name) protected  readonly model:Model<CouponDocument>){
        super(model)
    }
}