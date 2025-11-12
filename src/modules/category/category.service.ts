import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {  UpdateCategoryDto } from './dto/update-category.dto';
import { UserDocument } from 'src/DB/model/user.model';
import { CategoryDocument } from 'src/DB/model/category.model';
import { Types } from 'mongoose';
import { Lean } from 'src/DB/repository/database.repository';
import { IMulterFile } from 'src/common/interfaces/multer.interface';
import { CategoryRepository } from 'src/DB/repository/category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { BrandRepository } from 'src/DB/repository/brand.repository';
import { ProductRepository } from 'src/DB/repository/product.repository';
import { randomUUID } from 'crypto';
import { SearchDto } from 'src/common/dtos/search.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository ,private readonly brandRepository: BrandRepository, private readonly productRepository: ProductRepository){}
  async create(createCategoryDto: CreateCategoryDto,file:IMulterFile,user:UserDocument):Promise<CategoryDocument> {
    const{name}=createCategoryDto;
    const checkCategory=await this.categoryRepository.findOne({filter:{name,paranoId:false}});
    if(checkCategory){
      throw new ConflictException(checkCategory.freezedAt ? 'Duplicated with archived category' : 'Duplicated category name');
    }
   

  
    const image:string = file ? `/${file.finalPath}` : '';
    
    const category=await this.categoryRepository.create({
     data:
      {
        ...createCategoryDto,
        image,
        createdBy:user._id,
      
      }

     
    });
    return category;
  }

 async findAll(data:SearchDto,archive:boolean=false) {
  const{page,size,search}=data;
    const result=await this.categoryRepository.paginte({
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
      options:{
        populate:'products'
      }
    })
    return result;
  }
 async findOne(brandId: Types.ObjectId,archive:boolean=false) {
    const result=await this.categoryRepository.findOne({
      filter:{
        _id:brandId,
        ...(archive?{paranoId:false,freezedAt:{$exists:true}}:{}),
      },
      options:{
        populate:'products'
      }
    })
    if(!result){
      throw new NotFoundException('Brand not found');
    }
    return result;
  }



  async update(categoryId: Types.ObjectId, updateCategoryDto: UpdateCategoryDto,user:UserDocument):Promise<CategoryDocument|Lean<CategoryDocument>> {

    if(updateCategoryDto.name&& (await this.categoryRepository.findOne({filter:{name:updateCategoryDto.name}}))){
      throw new ConflictException('Category already exists');
    }
    const updateBrandsRaw = updateCategoryDto.brands || [];
    const brands: Types.ObjectId[] = [
      ...new Set(
        updateBrandsRaw.map((brand) =>
          Types.ObjectId.createFromHexString(brand as unknown as string)
        )
      ),
    ];
    if (brands && (await this.brandRepository.find({ filter: { _id: { $in: brands } } })).length !== brands.length) {
      throw new BadRequestException('some of mentioned brands are not found');
    }
    const removeBrandsRaw = updateCategoryDto.removeBrands || [];
    const removeBrands: Types.ObjectId[] = [
      ...new Set(
        removeBrandsRaw.map((brand) =>
          Types.ObjectId.createFromHexString(brand as unknown as string)
        )
      ),
    ];
    const { removeBrands: _omitRemoveBrands, ...restUpdate } = updateCategoryDto as any;
    const category=await this.categoryRepository.findOneAndUpdate({
      filter:{_id:categoryId},
      update: [
        {
          $set: {
            ...restUpdate,
            updatedBy: user._id,
            brands: {
              $setUnion: [
                {
                  $setDifference: [
                    "$brands",
                    (removeBrands || []).map((brand) => {
                      return Types.ObjectId.createFromHexString(brand as unknown as string)
                    })
                  ]
                },
                (brands || []).map((brand) => {
                  return Types.ObjectId.createFromHexString(brand as unknown as string)
                })
              ]
            }
          }
        }
      ],
    })
    if(!category){
      throw new BadRequestException('Failed to update category');
    }
    return category;
  }
  async updateAttachment(categoryId: Types.ObjectId, file:IMulterFile,user:UserDocument):Promise<CategoryDocument|Lean<CategoryDocument>> {
    const existing = await this.categoryRepository.findOne({
      filter: { _id: categoryId },
    });
    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    const image = file ? `/${file.finalPath}` : ((existing as any).image || '');

    const updatePayload: any = { image, updatedBy: user._id };

    const updatedCategory = await this.categoryRepository.findOneAndUpdate({
      filter: { _id: categoryId },
      update: updatePayload,
    })
    if(!updatedCategory){
      throw new BadRequestException('Failed to update category');
    }
    return updatedCategory;
  }
  async freeze(categoryId: Types.ObjectId,user:UserDocument):Promise<string> {
const category=await this.categoryRepository.findOneAndUpdate({
  filter:{_id:categoryId},
  update:{freezedAt:new Date(),$unset:{restoredAt:true},updatedBy:user._id},options:{new:false},
})
if(!category){
  throw new BadRequestException('Failed to freeze category');
}
return "Done";
   
  }
    async restore(categoryId: Types.ObjectId,user:UserDocument):Promise<CategoryDocument|Lean<CategoryDocument>> {
const category=await this.categoryRepository.findOneAndUpdate({
  filter:{_id:categoryId ,paranoId:false,freezedAt:{$exists:true}},
  update:{restoredAt:new Date(),$unset:{freezedAt:true},updatedBy:user._id},options:{new:false},
})
if(!category){
  throw new BadRequestException('Failed to restore category');
}
return category;
   
  }

  async remove(categoryId: Types.ObjectId,user:UserDocument):Promise<string> {
    const category=await this.categoryRepository.findOneAndDelete({
      filter:{_id:categoryId ,}
   
    })
    if(!category){
      throw new BadRequestException('Failed to remove category');
    }
    await this.productRepository.deleteMany({ category: categoryId } as any);
    return "Done";
       
      }
}
