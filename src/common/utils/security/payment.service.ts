import { BadRequestException, Injectable } from "@nestjs/common";
import type { Request } from "express";
import Stripe from "stripe";

@Injectable()
export class PaymentService {
private stripe:Stripe;
constructor(){
    this.stripe=new Stripe(process.env.STRIPE_SECRET as string);
}


async checkoutSession({customer_email,cancel_url=process.env.CANCEL_URL as string,success_url=process.env.SUCCESS_URL as string,metadata={},discounts=[],mode="payment",line_items}:Stripe.Checkout.SessionCreateParams):Promise<Stripe.Checkout.Session>{
    const session=await this.stripe.checkout.sessions.create({
        customer_email,
        cancel_url,
        success_url,
        metadata,
        discounts,
        mode,
        line_items
    })
    return session
}

async createCoupon(data:Stripe.CouponCreateParams):Promise<Stripe.Coupon>{
    const coupon=await this.stripe.coupons.create(data)
    return coupon
}
async webhook(req: Request):Promise<Stripe.Event>{
    const endpointSecret=process.env.STRIPE_WEBHOOK_SECRET as string;
    const sig=req.headers['stripe-signature'] as string;
    const event:Stripe.Event=this.stripe.webhooks.constructEvent(req.body,sig,endpointSecret);

    if(event.type!=='checkout.session.completed'){
      throw new BadRequestException('fail to pay');
    }
    
    return event;
    }

async createPaymentIntent(data:Stripe.PaymentIntentCreateParams):Promise<Stripe.PaymentIntent>{
const paymentIntent=await this.stripe.paymentIntents.create(data)
return paymentIntent;


}
async createPaymentMethodIntent(data:Stripe.PaymentMethodCreateParams):Promise<Stripe.PaymentMethod>{
const paymentMethodIntent=await this.stripe.paymentMethods.create(data)
console.log(paymentMethodIntent);
return paymentMethodIntent;


}

async retrievePaymentIntent(id:string):Promise<Stripe.PaymentIntent>{

const intent=await this.stripe.paymentIntents.retrieve(id)
return intent;
}
async confirmPaymentIntent(id:string):Promise<Stripe.PaymentIntent>{
    const intent =await this.retrievePaymentIntent(id)
    if(intent?.status!='requires_confirmation'){
        throw new BadRequestException('fail to confirm payment intent');
    }
    const confirmedIntent=await this.stripe.paymentIntents.confirm(id)
    console.log(confirmedIntent);
    return confirmedIntent;
}
async refundPaymentIntent(id:string){
    const intent =await this.retrievePaymentIntent(id)
    if(intent?.status!='succeeded'){
        throw new BadRequestException('fail to refund payment intent');
    }
    const refund=await this.stripe.refunds.create({
        payment_intent:intent.id,
    })
    return refund 
}



}