import { IsMongoId, IsNumber, IsPositive, Min } from "class-validator";
import { Types } from "mongoose";
import { ICart, ICartProduct } from "src/common/interfaces/cart.interface";
import { IProduct } from "src/common/interfaces/product.interface";

export class CreateCartDto  implements Partial<ICartProduct> {

    @IsMongoId()
    productId: Types.ObjectId 
    @Min(1)
    @IsNumber()
    @IsPositive()
    quantity: number;
}
