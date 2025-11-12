import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, UpdateQuery } from "mongoose";
import slugify from "slugify";
import { IUser } from "src/common";
import { CouponType } from "src/common/enums/coupon.enum";
import { IBrand } from "src/common/interfaces/brand.interface";
import { ICoupon } from "src/common/interfaces/coupon.interface";



@Schema({
    timestamps:true,
    strictQuery:true,
})
export class Coupon implements ICoupon {

    @Prop({type:String,required:true,unique:true,minLength:2,maxLength:26})
    name:string
    @Prop({type:String,minLength:2,maxLength:50})
    slug:string
   
    @Prop({type:String,required:false})
    image:string
    @Prop({type:Types.ObjectId,required:true,ref:"User"})
    createdBy:Types.ObjectId | IUser
    @Prop({type:Types.ObjectId,ref:"User"})
    updatedBy:Types.ObjectId | IUser
    @Prop({
        type:[{type:Types.ObjectId,ref:"User"}]
    })
    usedBy:Types.ObjectId[] | IUser[]
     
    @Prop({type:Date,required:true})
    startDate: Date
    @Prop({type:Date,required:true})
    endDate: Date
    @Prop({type:Number,required:true ,default:1})
    duration: number
    @Prop({type:Number,required:true})
    discount: number
    @Prop({type:String,enum:CouponType,default:CouponType.Percent})
    type:CouponType


    @Prop({type:Date})
    freezedAt: Date 
    @Prop({type:Date})
    restoredAt: Date 

}
export type CouponDocument = HydratedDocument<Coupon>;
const couponSchema = SchemaFactory.createForClass(Coupon);

couponSchema.pre('save',async function(next){

  if(this.isModified('name')){

this.slug=slugify(this.name)
next()

}})
couponSchema.pre(['findOneAndUpdate','updateOne'],async function(next){

  const update=this.getUpdate() as UpdateQuery<Coupon>
  if(update.name){
this.setUpdate({...update,slug:slugify(update.name)})
  }
  next()

})
couponSchema.pre(['findOne','find'],async function(next){

const query=this.getQuery();
if(query.paranoId===false){
  this.setQuery({...query})
}else{
  this.setQuery({...query,freezedAt:{$exists:false}})
}

  next()
})

export const CouponModel=MongooseModule.forFeature([{name:Coupon.name,schema:couponSchema}])