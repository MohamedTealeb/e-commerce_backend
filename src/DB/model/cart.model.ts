import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { Types } from "mongoose";
import { IUser } from "src/common";
import { ICart, ICartProduct } from "src/common/interfaces/cart.interface";
import { IProduct } from "src/common/interfaces/product.interface";



@Schema({

timestamps:true,
strictQuery:true,

})

export class CartProduct implements ICartProduct {
    @Prop({type:Types.ObjectId,ref:"Product",required:true})
    productId: Types.ObjectId | IProduct;
    @Prop({type:Number,required:true})
    quantity: number;

}

@Schema({
    timestamps:true,
    strictQuery:true,
})
export class Cart implements ICart {



@Prop({type:Types.ObjectId,ref:"User",required:true,unique:true})
createdBy: Types.ObjectId | IUser;
@Prop([CartProduct])
products: CartProduct[];


}
export type CartProductDocument=HydratedDocument<CartProduct>;
export type CartDocument=HydratedDocument<Cart>;
const CartSchema=SchemaFactory.createForClass(Cart);

export const CartModel=MongooseModule.forFeature([{name:Cart.name,schema:CartSchema}]);


