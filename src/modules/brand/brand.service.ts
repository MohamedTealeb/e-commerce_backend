import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { GetAllDto, UpdateBrandDto } from './dto/update-brand.dto';
import { BrandRepository } from 'src/DB/repository/brand.repository';
import { UserDocument } from 'src/DB/model/user.model';
import { BrandDocument } from 'src/DB/model/brand.model';
import { Types } from 'mongoose';
import { Lean } from 'src/DB/repository/database.repository';
import { IMulterFile } from 'src/common/interfaces/multer.interface';
import { SearchDto } from 'src/common/dtos/search.dto';

@Injectable()
export class BrandService {
  constructor(private readonly brandRepository: BrandRepository ){}
  async create(createBrandDto: CreateBrandDto,file:IMulterFile,user:UserDocument):Promise<BrandDocument> {
    const{name,slogan}=createBrandDto;
    const checkBrand=await this.brandRepository.findOne({filter:{name,paranoId:false}});
    if(checkBrand){
      throw new ConflictException(checkBrand.freezedAt ? 'Duplicated with archived brand' : 'Duplicated brand name');
    }
    
    // Use the finalPath from multer configuration for local file upload
    const image:string = file ? `/${file.finalPath}` : '';
    
    const brand=await this.brandRepository.create({
      data:{
        name,
        slogan,
        image,
        createdBy:user._id,
      },
    });
    if(!brand){
      throw new BadRequestException('Failed to create brand');
    }
    return brand;
  }

 async findAll(data:SearchDto,archive:boolean=false) {
  const{page,size,search}=data;
    const result=await this.brandRepository.paginte({
      filter:{
        ...(search ?{$or:[
          {name:{$regex:search,$options:'i'}},
          {slug:{$regex:search,$options:'i'}},
          {slogan:{$regex:search,$options:'i'}},
        ]}:{}),
        ...(archive?{paranoId:false,freezedAt:{$exists:true}}:{}),
      
      },
      page,
      size,
    })
    return result;
  }
 async findOne(brandId: Types.ObjectId,archive:boolean=false) {
    const result=await this.brandRepository.findOne({
      filter:{
        _id:brandId,
        ...(archive?{paranoId:false,freezedAt:{$exists:true}}:{}),
      },
    })
    if(!result){
      throw new NotFoundException('Brand not found');
    }
    return result;
  }



  async update(brandId: Types.ObjectId, updateBrandDto: UpdateBrandDto,user:UserDocument):Promise<BrandDocument|Lean<BrandDocument>> {

    if(updateBrandDto.name&& (await this.brandRepository.findOne({filter:{name:updateBrandDto.name}}))){
      throw new ConflictException('Brand already exists');
    }
    const brand=await this.brandRepository.findOneAndUpdate({
      filter:{_id:brandId},
      update:{...updateBrandDto,updatedBy:user._id},
    })
    if(!brand){
      throw new BadRequestException('Failed to update brand');
    }
    return brand;
  }
  async updateAttachment(brandId: Types.ObjectId, file:IMulterFile,user:UserDocument):Promise<BrandDocument|Lean<BrandDocument>> {
const image = file ? `/${file.finalPath}` : '';
const brand=await this.brandRepository.findOneAndUpdate({
  filter:{_id:brandId},
  update:{image,updatedBy:user._id},
})
if(!brand){
  throw new BadRequestException('Failed to update brand');
}
return brand;
   
  }
  async freeze(brandId: Types.ObjectId,user:UserDocument):Promise<string> {
const brand=await this.brandRepository.findOneAndUpdate({
  filter:{_id:brandId},
  update:{freezedAt:new Date(),$unset:{restoredAt:true},updatedBy:user._id},options:{new:false},
})
if(!brand){
  throw new BadRequestException('Failed to freeze brand');
}
return "Done";
   
  }
  async restore(brandId: Types.ObjectId,user:UserDocument):Promise<BrandDocument|Lean<BrandDocument>> {
const brand=await this.brandRepository.findOneAndUpdate({
  filter:{_id:brandId ,paranoId:false,freezedAt:{$exists:true}},
  update:{restoredAt:new Date(),$unset:{freezedAt:true},updatedBy:user._id},options:{new:false},
})
if(!brand){
  throw new BadRequestException('Failed to restore brand');
}
return brand;
   
  }

  async remove(brandId: Types.ObjectId,user:UserDocument):Promise<string> {
    const brand=await this.brandRepository.findOneAndDelete({
      filter:{_id:brandId ,paranoId:false,freezedAt:{$exists:true}}
   
    })
    if(!brand){
      throw new BadRequestException('Failed to remove brand');
    }
    
    return "Done";
       
      }
}
