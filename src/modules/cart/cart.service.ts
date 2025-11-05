import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { RemoveItemCartDto, UpdateCartDto } from './dto/update-cart.dto';
import { CartRepository } from 'src/DB/repository/cart.repository';
import { ProductRepository } from 'src/DB/repository/product.repository';
import { UserDocument } from 'src/DB/model/user.model';
import { CartDocument } from 'src/DB/model/cart.model';
import { Types } from 'mongoose';

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository,private readonly productRepository: ProductRepository) {}
 async create(createCartDto: CreateCartDto,user:UserDocument):Promise<{cart:CartDocument,status:number}> {
  const product=await this.productRepository.findOne({filter:{_id:createCartDto.productId ,stock:{$gte:createCartDto.quantity}}});
  if(!product) throw new NotFoundException('fail to find matching product or product is out of stock');
  const cart=await this.cartRepository.findOne({filter:{createdBy:user._id}});
  if(!cart){
    const NewCart=await this.cartRepository.create({
      data:{
        createdBy:user._id,
        products:[{
          productId:product._id,
          quantity:createCartDto.quantity
        }]
      }
    }
  )
  if (!NewCart) {
    throw new BadRequestException('fail to create new cart');
  }
  return{status:201,cart:NewCart}
  }
  const productInCart=cart.products.find(product=>{ return product.productId==createCartDto.productId});
  if(productInCart){

productInCart.quantity+=createCartDto.quantity;



  }else{

cart.products.push({
  productId:product._id,
  quantity:createCartDto.quantity
})

  }

  await cart.save();


  
  return {cart,status:200};
  }
 async removeItem(removeItemCartDto: RemoveItemCartDto,user:UserDocument):Promise<CartDocument> {
 const cart=await this.cartRepository.findOneAndUpdate({
  filter:{createdBy:user._id},
  update:{
  $pull:{products:{productId:{$in:removeItemCartDto.productId.map(product=>{return Types.ObjectId.createFromHexString(product as unknown as string)})}}}}
 });
  if(!cart){
  throw new NotFoundException('cart not found');
  
  
  }
  return cart;
  }
 async removeCart(user:UserDocument):Promise<string> {
 const cart=await this.cartRepository.deleteOne({
  filter:{createdBy:user._id},
 });
  if(!cart.deletedCount){
  throw new NotFoundException('cart not found');
  
  
  }
  return 'Cart removed successfully';
  }
 async findOne(user:UserDocument):Promise<CartDocument> {
 const cart=await this.cartRepository.findOne({
  filter:{createdBy:user._id},
  options:{
  populate:[
    {
      path:"products.productId",
    }
  ]
  }
 });
  if(!cart){
  throw new NotFoundException('cart not found');
  
  
  }
  return cart;
  }




}
