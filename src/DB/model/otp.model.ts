import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { IUser } from "src/common";
import { otpEnum } from "src/common/enums/otp.enum";
import { IOtp } from "src/common/interfaces/otp.interface";
import { emailEvent } from "src/common/utils/email/email.event";
import { generateHash } from "src/common/utils/security/hash.security";


@Schema({ timestamps: true})

export class Otp implements IOtp {
    _id?: Types.ObjectId;
    
     @Prop({type:String,required:true})
    code:string;

    @Prop({type:Date,required:true})
    expiredAt:Date;

    @Prop({type:Types.ObjectId,ref:"User",required:true})
    createdBy:Types.ObjectId;

    @Prop({type:String,enum:otpEnum,required:true})
    type:otpEnum
}
export const OtpSchema = SchemaFactory.createForClass(Otp);

OtpSchema.pre("save",async function(this:OtpDocument&{wasNew:boolean,plainOtp?:string},next){
    this.wasNew=this.isNew
    if(this.isModified("code")){
        this.plainOtp=this.code
    this.code=await generateHash(this.code)
    await this.populate([{path:"createdBy",select:"email"}])
  }
  next()
}
) 

OtpSchema.post("save",async function(doc ,next){
    const that=this as OtpDocument&{wasNew:boolean,plainOtp?:string}

    if(that.wasNew&&that.plainOtp){
   emailEvent.emit(that.type,{
    to:(that.createdBy as any).email,
    otp:that.plainOtp,
   })
    }


    next()

})


export  type OtpDocument = HydratedDocument<Otp>;
OtpSchema.index({expiredAt:1},{expireAfterSeconds:0})
export const OtpModel = MongooseModule.forFeature([{name:Otp.name,schema:OtpSchema}])