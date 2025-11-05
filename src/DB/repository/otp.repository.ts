import { Injectable } from "@nestjs/common";
import { Otp, OtpDocument, OtpModel } from "../model/otp.model";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { DataBaseRepository } from "./database.repository";



@Injectable()

export class OtpRepository extends DataBaseRepository<Otp, OtpDocument>{
constructor(@InjectModel (Otp.name)  protected override readonly model:Model<OtpDocument>){
    super(model)
}

async deleteMany(filter: any): Promise<number> {
    const res = await this.model.deleteMany(filter as any);
    // @ts-ignore
    return res?.deletedCount ?? 0;
}

}