import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto, CouponParamsDto } from './dto/update-coupon.dto';
import { Auth } from 'src/common/decoretors/auth.decoretors';
import { User } from 'src/common/decoretors/credential.decorator';
import type{ UserDocument } from 'src/DB/model/user.model';
import { FileInterceptor } from '@nestjs/platform-express';
import { localFileUpload } from 'src/common/utils/multer/local.multer';
import { FileValidation } from 'src/common/utils/multer/validation.multer';
import { succesResponse } from 'src/common/utils/response';
import { ICoupon } from 'src/common/interfaces/coupon.interface';
import { CouponResponse } from './entities/coupon.entity';
import { endpoint } from './coupon.authorization.module';
import { SearchDto } from 'src/common/dtos/search.dto';


@UsePipes(new ValidationPipe({whitelist:true ,forbidNonWhitelisted:true}))
@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @UseInterceptors(FileInterceptor('attachment',localFileUpload({folder:'coupons',vaildation:FileValidation.image})))
  @Auth(endpoint.create)
  @Post()
 async create(@Body() createCouponDto: CreateCouponDto ,@User() user:UserDocument,@UploadedFile() file?:Express.Multer.File) {
   const coupon=await this.couponService.create(createCouponDto,user,file);
    return succesResponse <ICoupon>({
      data:coupon,
      message:"Coupon created successfully",
      status:201
    })
  }

  @Get()
  async findAll(@Query() query: SearchDto) {
    const result=await this.couponService.findAll(query);
    return succesResponse({data:{result},message:"Coupons found successfully",status:200})
  }

  @Get(':id')
 async findOne(@Param() params: CouponParamsDto) {
   const  coupon=await this.couponService.findOne(params.id);

    return succesResponse({data:{coupon},message:"Coupon found successfully",status:200})
  }

  @Auth(endpoint.create)
  @Patch(':id')
  async update(@Param() params: CouponParamsDto, @Body() updateCouponDto: UpdateCouponDto, @User() user:UserDocument) {
    const coupon=await this.couponService.update(params.id, updateCouponDto, user);
    return succesResponse({data:{coupon},message:"Coupon updated successfully",status:200})
  }

  @Auth(endpoint.create)
  @Delete(':id')
  async remove(@Param() params: CouponParamsDto, @User() user:UserDocument) {
    const result=await this.couponService.remove(params.id, user);
    return succesResponse<string>({data:result,message:"Coupon removed successfully",status:200})
  }

  @Auth(endpoint.create)
  @Patch(':id/freeze')
  async freeze(@Param() params: CouponParamsDto, @User() user:UserDocument) {
    const result=await this.couponService.freeze(params.id, user);
    return succesResponse<string>({data:result,message:"Coupon frozen successfully",status:200})
  }

  @Auth(endpoint.create)
  @Patch(':id/restore')
  async restore(@Param() params: CouponParamsDto, @User() user:UserDocument) {
    const coupon=await this.couponService.restore(params.id, user);
    return succesResponse({data:{coupon},message:"Coupon restored successfully",status:200})
  }
}
