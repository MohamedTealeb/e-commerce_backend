import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, UpdateQuery } from "mongoose";
import slugify from "slugify";
import { IUser } from "src/common";
import { IBrand } from "src/common/interfaces/brand.interface";



@Schema({
    timestamps:true,
    strictQuery:true,
    toObject:{virtuals:true},
    toJSON:{virtuals:true}
})
export class Brand implements IBrand {

    @Prop({type:String,required:true,unique:true,minLength:2,maxLength:26})
    name:string
    @Prop({type:String,minLength:2,maxLength:50})
    slug:string
    @Prop({type:String,required:true,minLength:2,maxLength:26})
    slogan:string
    @Prop({type:String,required:true})
    image:string
    @Prop({type:Types.ObjectId,required:true,ref:"User"})
    createdBy:Types.ObjectId | IUser
    @Prop({type:Types.ObjectId,ref:"User"})
    updatedBy:Types.ObjectId | IUser
    @Prop({type:Types.ObjectId,ref:"Category"})
    category?: Types.ObjectId;
    @Prop({type:Date})
    freezedAt?: Date 
    @Prop({type:Date})
    restoredAt?: Date 

}
export type BrandDocument = HydratedDocument<Brand>;
const brandSchema = SchemaFactory.createForClass(Brand);

brandSchema.pre('save',async function(next){

  if(this.isModified('name')){

this.slug=slugify(this.name)
next()

}})
brandSchema.pre(['findOneAndUpdate','updateOne'],async function(next){

  const update=this.getUpdate() as UpdateQuery<Brand>
  if(update.name){
this.setUpdate({...update,slug:slugify(update.name)})
  }
  next()

})
brandSchema.pre(['findOne','find'],async function(next){

const query=this.getQuery();
if(query.paranoId===false){
  this.setQuery({...query})
}else{
  this.setQuery({...query,freezedAt:{$exists:false}})
}

  next()
})
// virtual populate: products under this brand
brandSchema.virtual('products',{
  ref: 'Product',
  localField: '_id',
  foreignField: 'brand',
  justOne: false,
})
export const BrandModel=MongooseModule.forFeature([{name:Brand.name,schema:brandSchema}])