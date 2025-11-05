import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Res } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { RemoveItemCartDto, UpdateCartDto } from './dto/update-cart.dto';
import { Auth } from 'src/common/decoretors/auth.decoretors';
import { RoleEnum } from 'src/common/enums/user.enum';
import { Type } from 'class-transformer';
import type { UserDocument } from 'src/DB/model/user.model';
import { User } from 'src/common/decoretors/credential.decorator';
import { CartResponse } from './entities/cart.entity';
import { succesResponse } from 'src/common/utils/response';
import { IResponse } from 'src/common/interfaces/response.interfae';
import  type {  Response } from 'express';

@Auth([RoleEnum.USER])
@UsePipes(new ValidationPipe({whitelist:true ,forbidNonWhitelisted:true}))
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
 async create(@Body() createCartDto: CreateCartDto, @User() user:UserDocument,@Res({passthrough:true}) res:Response):Promise<IResponse<CartResponse>> {
   const {cart,status}=await this.cartService.create(createCartDto,user);
   res.status(status);
    return succesResponse<CartResponse>({status,data:{cart},message:'Cart created successfully'})
  }
  @Patch('remove-from-cart')
 async removeItem(@Body() removeItemCartDto: RemoveItemCartDto, @User() user:UserDocument):Promise<IResponse<CartResponse>> {
   const cart=await this.cartService.removeItem(removeItemCartDto,user);

    return succesResponse<CartResponse>({data:{cart},message:'Cart removed from successfully'})
  }
  @Delete()
 async removeCart(@User() user:UserDocument):Promise<IResponse> {
   const cart=await this.cartService.removeCart(user);

    return succesResponse<string>({data:'Cart removed from successfully',message:'Cart removed from successfully'})
  }
  @Get()
 async findOne(@User() user:UserDocument):Promise<IResponse<CartResponse>> {
   const cart=await this.cartService.findOne(user);

    return succesResponse<CartResponse>({data:{cart}})
  }



}
