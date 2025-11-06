import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, UpdateQuery } from "mongoose";
import { IProduct } from "src/common/interfaces/product.interface";
import { IBrand } from "src/common/interfaces/brand.interface";
import slugify from "slugify";


@Schema({
    timestamps:true,
    strictQuery:true,
})
export class Product implements IProduct {
  @Prop({type:String,required:true,minLength:2,maxLength:2226})
    name:string;
    @Prop({type:String,minLength:2,maxLength:50})
    slug:string;
    @Prop({type:String,minLength:2,maxLength:5000})
    description?:string;
    @Prop({type:[String],required:true})
    images:string[];
    @Prop({type:Types.ObjectId,required:false,ref:"Brand"})
    brand?: Types.ObjectId | IBrand;
    @Prop({type:Types.ObjectId,required:true,ref:"Category"})
    category: Types.ObjectId ;
    @Prop({type:Number,default:0})
    discountPercent:number;
    @Prop({type:Number,required:true})
    originalPrice:number;
    @Prop({type:Number,required:true})
    salePrice:number;
    @Prop({type:Number,required:true})
    stock:number;
    @Prop({
      type:[{
        sku:{type:String},
        attributes:{ type: Map, of: String },
        originalPrice:{type:Number},
        discountPercent:{type:Number},
        salePrice:{type:Number},
        stock:{type:Number, required:true},
      }],
      default:[]
    })
    variants?: IProduct["variants"];
    @Prop({type:Number,default:0})
    soldItems:number;
    @Prop({type:Types.ObjectId,required:true,ref:"User"})
    createdBy: Types.ObjectId ;
    @Prop({type:Types.ObjectId,ref:"User"})
    updatedBy: Types.ObjectId ;

@Prop({type:Date})
    freezedAt?: Date ;
    @Prop({type:Date})
    restoredAt?: Date ;



}
export type ProductDocument = HydratedDocument<Product>;
const productSchema = SchemaFactory.createForClass(Product);

productSchema.pre('save',async function(next){

    if(this.isModified('name')){
  
  this.slug=slugify(this.name)
 
  

  next()
  
  }})
productSchema.pre('save',async function(next){
  // compute salePrice for variants if needed and total stock
  try{
    // @ts-ignore
    const self = this as any;
    if (Array.isArray(self.variants) && self.variants.length) {
      let totalStock = 0;
      self.variants = self.variants.map((v:any)=>{
        const baseOP = typeof self.originalPrice === 'number' ? self.originalPrice : 0;
        const baseDP = typeof self.discountPercent === 'number' ? self.discountPercent : 0;
        const op = typeof v.originalPrice === 'number' ? v.originalPrice : baseOP;
        const dp = typeof v.discountPercent === 'number' ? v.discountPercent : baseDP;
        const sp = op - (op * (dp/100));
        const variantStock = typeof v.stock === 'number' ? v.stock : 0;
        totalStock += variantStock;
        return { ...v, salePrice: (typeof v.salePrice === 'number' ? v.salePrice : (sp > 0 ? sp : 1)) };
      });
      if (typeof self.stock !== 'number' || self.stock < 0) {
        self.stock = totalStock;
      }
    } else {
      // compute main salePrice
      const op = typeof (this as any).originalPrice === 'number' ? (this as any).originalPrice : 0;
      const dp = typeof (this as any).discountPercent === 'number' ? (this as any).discountPercent : 0;
      const sp = op - (op * (dp/100));
      // @ts-ignore
      this.salePrice = sp > 0 ? sp : 1;
    }
  }catch(e){}
  next();
})
  productSchema.pre(['findOneAndUpdate','updateOne'],async function(next){
  
    const update=this.getUpdate() as UpdateQuery<Product>
    if(update.name){
  this.setUpdate({...update,slug:slugify(update.name)})
    }
    // recompute salePrice if price fields or variants updated
    const u:any = this.getUpdate();
    if (u && (u.originalPrice !== undefined || u.discountPercent !== undefined || u.variants !== undefined)){
      const $set = u.$set ?? {};
      if (u.originalPrice !== undefined || u.discountPercent !== undefined){
        const op = $set.originalPrice ?? u.originalPrice;
        const dp = $set.discountPercent ?? u.discountPercent ?? 0;
        if (typeof op === 'number'){
          const sp = op - (op * (dp/100));
          $set.salePrice = sp > 0 ? sp : 1;
        }
      }
      if (u.variants !== undefined || $set.variants !== undefined){
        const variants = $set.variants ?? u.variants;
        if (Array.isArray(variants)){
          let totalStock = 0;
          const mapped = variants.map((v:any)=>{
            const baseOP = ($set.originalPrice ?? u.originalPrice);
            const baseDP = ($set.discountPercent ?? u.discountPercent ?? 0);
            const op = typeof v.originalPrice === 'number' ? v.originalPrice : (typeof baseOP === 'number' ? baseOP : 0);
            const dp = typeof v.discountPercent === 'number' ? v.discountPercent : (typeof baseDP === 'number' ? baseDP : 0);
            const sp = op - (op * (dp/100));
            const vs = typeof v.stock === 'number' ? v.stock : 0;
            totalStock += vs;
            return { ...v, salePrice: (typeof v.salePrice === 'number' ? v.salePrice : (sp > 0 ? sp : 1)) };
          });
          $set.variants = mapped;
          if ($set.stock === undefined) $set.stock = totalStock;
        }
      }
      this.setUpdate({ ...u, $set });
    }
    next()
  
  })
  productSchema.pre(['findOne','find'],async function(next){
  
  const query=this.getQuery();
  if(query.paranoId===false){
    this.setQuery({...query})
  }else{
    this.setQuery({...query,freezedAt:{$exists:false}})
  }
  
    next()
  })
  export const ProductModel=MongooseModule.forFeature([{name:Product.name,schema:productSchema}])