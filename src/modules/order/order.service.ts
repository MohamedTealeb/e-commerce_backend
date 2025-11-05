import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UserDocument } from 'src/DB/model/user.model';
import { OrderDocument, OrderProduct } from 'src/DB/model/oreder.model';
import { OrderRepository } from 'src/DB/repository/order.repository';
import { CartRepository } from 'src/DB/repository/cart.repository';
import { ProductRepository } from 'src/DB/repository/product.repository';
import { IOrderProduct } from 'src/common/interfaces/order.interface';
import { randomUUID } from 'crypto';
import { CartService } from '../cart/cart.service';
import { CouponRepository } from 'src/DB/repository/coupon.repository';
import { CouponType } from 'src/common/enums/coupon.enum';
import { Types } from 'mongoose';
import { OrderStatus, OrderStatusName, PaymentType } from 'src/common/enums/payment.enums';
import { PaymentService } from 'src/common/utils/security/payment.service';
import { ProductDocument } from 'src/DB/model/product.model';
import Stripe from 'stripe';
import type { Request as ExpressRequest } from 'express';

@Injectable()
export class OrderService {
  constructor(private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly cartService: CartService,
    private readonly couponRepository: CouponRepository,
    private readonly paymentService: PaymentService,

  ) {}


  async webhook(req: ExpressRequest) {
    const event=await this.paymentService.webhook(req);
    const session=event.data.object as Stripe.Checkout.Session;
    const orderId=session.metadata?.orderId;
    
    if(!orderId){
      throw new BadRequestException('orderId not found in metadata');
    }
    
    if(session.payment_status!=='paid'){
      throw new BadRequestException('payment not completed');
    }
    
    const orderObjectId=Types.ObjectId.createFromHexString(orderId);
    
    const existingOrder=await this.orderRepository.findOne({filter:{_id:orderObjectId}});
    if(!existingOrder){
      throw new BadRequestException('order not found');
    }
    
    if(existingOrder.status!==OrderStatus.Pending || existingOrder.paymentType!==PaymentType.Card){
      throw new BadRequestException('order is already paid or cancelled');
    }
    
    if(existingOrder.paidAt){
      throw new BadRequestException('order has already been paid');
    }
    
    if(existingOrder.paymentIntent && existingOrder.paymentIntent===session.payment_intent){
      return existingOrder;
    }
    
    const order=await this.orderRepository.findOneAndUpdate({filter:{_id:orderObjectId,status:OrderStatus.Pending,paymentType:PaymentType.Card,paidAt:{$exists:false}},update:{
      paidAt:new Date(),
      status:OrderStatus.Placed,
      paymentIntent:session.payment_intent as string,
      intentId:session.payment_intent as string,
    },options:{new:true}});
    
    if(!order){
      throw new BadRequestException('order not found, order is not pending, or order has already been paid');
    }
    const paymentIntentId = order.paymentIntent || order.intentId || session.payment_intent;
    if(!paymentIntentId){
      throw new BadRequestException('Payment intent ID not found');
    }
    await this.paymentService.confirmPaymentIntent(paymentIntentId as string)
    return order;
  }
 async create(createOrderDto: CreateOrderDto,user:UserDocument): Promise<OrderDocument> {
  const cart=await this.cartService.findOne(user);
  if(!cart?.products?.length){
    throw new BadRequestException('cart is empty');
  }
  let discount:number=0;
  let coupon:any;
  if(createOrderDto.coupon){
    coupon=await this.couponRepository.findOne({filter:{_id:createOrderDto.coupon,
      startDate:{$lte:new Date()},
      endDate:{$gte:new Date()},
    }});
    if(!coupon){
      throw new BadRequestException('coupon not found or coupon is expired');
    }
    if(coupon.duration<=coupon.usedBy.filter((ele)=>{
      return ele.toString()===user._id.toString();
    }).length){
      throw new BadRequestException(`sorry you have reached the limit for this coupon can be used only ${coupon.duration} times at a time`);
    }
  }
  let total:number=0;
  const products:OrderProduct[]=[]
  for(const product of cart.products){
  const checkProduct=await this.productRepository.findOne({filter:{_id:product.productId,stock:{$gte:product.quantity}}});
  if(!checkProduct){
    throw new BadRequestException(`fail to find matching product with id ${product.productId} or product is out of stock`);
  }
  const finalPrice=Math.round((product.quantity*checkProduct.salePrice)*100)/100;
products.push({
  name:checkProduct.name,
  productId:checkProduct._id,
  quantity:product.quantity,
  unitPrice:Math.round(checkProduct.salePrice*100)/100,
  finalPrice,
})
 total+=finalPrice;
  }
  total=Math.round(total*100)/100;
  if(coupon){
    if(coupon.type===CouponType.Percent){
      discount=Math.round((total*coupon.discount/100)*100)/100;
    }else{
      discount=Math.round(coupon.discount*100)/100;
    }
  }
delete (createOrderDto as any).coupon;
    const order=await this.orderRepository.create({data:{
      ...createOrderDto,
      orderId:randomUUID().slice(0,8),
      discount,
      coupon:coupon?._id,
      total,
      products,
      createdBy:user._id,




    }})
    if(!order){
      throw new BadRequestException('fail to create order');
    }
    if(coupon){
      coupon.usedBy.push(user._id);
      await coupon.save();
    }
    const stockProducts:{productId:Types.ObjectId,stock:number}[]=[];
    for(const product of cart.products){
   const updatedProduct= await this.productRepository.findOneAndUpdate({filter:{_id:product.productId},update:{$inc:{__v:1,stock:-product.quantity}}}) as ProductDocument;
   stockProducts.push({
    productId:updatedProduct._id,
    stock:updatedProduct.stock,
   })
      }

      await this.cartService.removeCart(user);
    
    
    return order;
  }

  async checkout(orderId:Types.ObjectId,user:UserDocument) {
    const order=await this.orderRepository.findOne({
      filter:{_id:orderId,createdBy:user._id,paymentType:PaymentType.Card,status:OrderStatus.Pending},
    options:{
      populate:[
        {
          path:"products.productId",
          select:"name",
        }
      ]
    }
    
    });

if(!order){
  throw new BadRequestException('order not found or order is not pending');
}
let discount:Stripe.Checkout.SessionCreateParams.Discount[]=[]
if(order.discount && order.coupon){
  const couponDoc=await this.couponRepository.findOne({filter:{_id:order.coupon}});
  if(couponDoc){
    if(couponDoc.type===CouponType.Percent){
      const percentOff=Math.round(couponDoc.discount);
      const stripeCoupon=await this.paymentService.createCoupon({
        percent_off:percentOff,
        duration:"once",
        currency:"egp",
      })
      discount.push({
        coupon:stripeCoupon.id,
      })
    }else{
      const amountOff=Math.round(order.discount*100);
      const stripeCoupon=await this.paymentService.createCoupon({
        amount_off:amountOff,
        duration:"once",
        currency:"egp",
      })
      discount.push({
        coupon:stripeCoupon.id,
      })
    }
  }
}
const session=await this.paymentService.checkoutSession({
   
  customer_email:user.email,
  metadata:{
    orderId:order._id.toString(),
  },
  discounts:discount,

  line_items:order.products.map((product)=>{
    return {
      quantity:product.quantity,
      price_data:{
        currency:'egp',
        product_data:{
          name:(product.productId as ProductDocument).name,
        },
        unit_amount:Math.round(product.unitPrice*100),
      }
    }
  })
})
return session;
  }
  async refund(orderId:Types.ObjectId,user:UserDocument) {
    const order=await this.orderRepository.findOneAndUpdate({
      filter:{_id:orderId,status:{$lt:OrderStatus.Cancelled}},
      update:{status:OrderStatus.Cancelled,updatedBy:user._id},
    }
  );

if(!order){
  throw new BadRequestException('order not found or order is not pending');
}
for(const product of order.products){
  await this.productRepository.updateOne({filter:{_id:product.productId},update:{$inc:{__v:1,stock:+product.quantity}}});
  }

  if(order.coupon){
await this.couponRepository.updateOne({
  filter:{_id:order.coupon},
  update:{
    $pull:{
      usedBy:order.createdBy
    }
  }
})



  }
  if(order.paymentType===PaymentType.Card){
    const paymentIntentId = (order.paymentIntent as string) || (order.intentId as string);
    if(paymentIntentId){
      await this.paymentService.refundPaymentIntent(paymentIntentId)
    }
  }



  

return order;
  }

  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
