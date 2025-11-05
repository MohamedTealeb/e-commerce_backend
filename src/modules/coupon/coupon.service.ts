import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import type{ UserDocument } from 'src/DB/model/user.model';
import { CouponRepository } from 'src/DB/repository/coupon.repository';
import { CouponDocument } from 'src/DB/model/coupon.model';
import { SearchDto } from 'src/common/dtos/search.dto';
import { Types } from 'mongoose';

@Injectable()
export class CouponService {
  constructor(
    private readonly couponRepository:CouponRepository

  ){}
  async create(createCouponDto: CreateCouponDto,user:UserDocument,file:Express.Multer.File):Promise<CouponDocument> {
    const checkCoupon=await this.couponRepository.findOne({filter:{name:createCouponDto.name,paranoId:false}});
    if(checkCoupon){
      throw new ConflictException ('Duplicated coupon name');
    }
    const image:string = file ? `/coupons/${file.filename}` : '';
    const coupon=await this.couponRepository.create({
      data:{
        ...createCouponDto,
        image,
        createdBy:user._id,
      }
    });
    if(!coupon){
      throw new BadRequestException('Failed to create coupon');
    }
    return coupon;

  }

  async findAll(data:SearchDto):Promise<{docsCount?: number, limit?: number, pages?: number, currentPage?: number, result: CouponDocument[]}> {
    const {page=1,size=5,search}=data;
    const result=await this.couponRepository.paginte({
      filter:{
        ...(search?{name:{$regex:search,$options:'i'}}:{}),
        paranoId:false,
      },
      page,
      size,
    });
    return result;
  }

  async findOne(couponId:Types.ObjectId):Promise<CouponDocument> {
    const coupon=await this.couponRepository.findOne({
     filter:{_id:couponId},
    });
     if(!coupon){
     throw new NotFoundException('coupon not found');
     
     
     }
     return coupon;
     }
   

  async update(couponId: Types.ObjectId, updateCouponDto: UpdateCouponDto, user:UserDocument):Promise<CouponDocument> {
    const coupon=await this.couponRepository.findOne({filter:{_id:couponId}});
    if(!coupon){
      throw new NotFoundException('Coupon not found');
    }
    if(updateCouponDto.name){
      const checkCoupon=await this.couponRepository.findOne({filter:{name:updateCouponDto.name,paranoId:false}});
      if(checkCoupon&&checkCoupon._id.toString()!==couponId.toString()){
        throw new ConflictException('Coupon name already exists');
      }
    }
    const updatedCoupon=await this.couponRepository.findOneAndUpdate({
      filter:{_id:couponId},
      update:{...updateCouponDto,updatedBy:user._id},
    });
    if(!updatedCoupon){
      throw new BadRequestException('Failed to update coupon');
    }
    return updatedCoupon;
  }

  async remove(couponId: Types.ObjectId, user:UserDocument):Promise<string> {
    const coupon=await this.couponRepository.findOneAndDelete({
      filter:{_id:couponId,paranoId:false,freezedAt:{$exists:true}}
    });
    if(!coupon){
      throw new BadRequestException('Failed to remove coupon');
    }
    return "Done";
  }

  async freeze(couponId: Types.ObjectId, user:UserDocument):Promise<string> {
    const coupon=await this.couponRepository.findOneAndUpdate({
      filter:{_id:couponId},
      update:{freezedAt:new Date(),$unset:{restoredAt:true},updatedBy:user._id},
      options:{new:false},
    });
    if(!coupon){
      throw new BadRequestException('Failed to freeze coupon');
    }
    return "Done";
  }

  async restore(couponId: Types.ObjectId, user:UserDocument):Promise<CouponDocument> {
    const coupon=await this.couponRepository.findOneAndUpdate({
      filter:{_id:couponId,paranoId:false,freezedAt:{$exists:true}},
      update:{restoredAt:new Date(),$unset:{freezedAt:true},updatedBy:user._id},
      options:{new:false},
    });
    if(!coupon){
      throw new BadRequestException('Failed to restore coupon');
    }
    return coupon;
  }
}
