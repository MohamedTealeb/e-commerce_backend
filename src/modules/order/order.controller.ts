import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Req } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, OrderParamDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import type { Request } from 'express';
import { RoleEnum } from 'src/common/enums/user.enum';
import { Auth } from 'src/common/decoretors/auth.decoretors';
import { User } from 'src/common/decoretors/credential.decorator';
import type { UserDocument } from 'src/DB/model/user.model';
import { succesResponse } from 'src/common/utils/response';
import { OrderResponse } from './entities/order.entity';
import { IResponse } from 'src/common/interfaces/response.interfae';
import Stripe from 'stripe';
import  type { Request as ExpressRequest } from 'express';

@UsePipes(new ValidationPipe({whitelist:true ,forbidNonWhitelisted:true}))
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Auth([RoleEnum.USER])
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @User() user:UserDocument):Promise<IResponse<OrderResponse>> {
  const order= await this.orderService.create(createOrderDto,user);
    return succesResponse<OrderResponse>({data:{order},status:201})
  }
  @Auth([RoleEnum.ADMIN])
  @Patch(":orderId/cancel")
  refund(@Param() params: OrderParamDto, @User() user:UserDocument) {
   return this.orderService.refund(params.orderId,user);
     
  }

  @Auth([RoleEnum.USER])
  @Post(":orderId")
  async checkout(
    
    @Param() params: OrderParamDto,
     @User() user:UserDocument) {
  const order= await this.orderService.checkout(params.orderId,user);
    return succesResponse<Stripe.Checkout.Session>({data:order,status:201})
  }



@Post("webhook")
async webhook(@Req() req: Request) {

   await this.orderService.webhook(req);
  return succesResponse<string>({data:'Webhook received successfully',status:200})
}

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
