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
        createdBy: user._id,
      },
    });
    return category;
  }

 async findAll(data:SearchDto,archive:boolean=false) {
  const{page,size,search}=data;
    
    // Get all categories that have subcategories to exclude subcategory IDs
    const categoriesWithSubcategories = await this.categoryRepository.find({
      filter: {
        subcategories: { $exists: true, $ne: [] },
        ...(archive ? {} : { freezedAt: { $exists: false } }),
      },
      select: 'subcategories',
    });

    // Collect all subcategory IDs
    const subcategoryIds = new Set<string>();
    categoriesWithSubcategories.forEach((cat) => {
      if (cat.subcategories && Array.isArray(cat.subcategories)) {
        cat.subcategories.forEach((sub: any) => {
          const subId = typeof sub === 'object' && sub._id ? sub._id.toString() : sub.toString();
          subcategoryIds.add(subId);
        });
      }
    });

    const result=await this.categoryRepository.paginte({
      filter:{
        ...(search ?{$or:[
          {name:{$regex:search,$options:'i'}},
          {slug:{$regex:search,$options:'i'}},
          {slogan:{$regex:search,$options:'i'}},
        ]}:{}),
        ...(archive?{paranoId:false,freezedAt:{$exists:true}}:{}),
        // Exclude categories that are used as subcategories
        ...(subcategoryIds.size > 0 ? { _id: { $nin: Array.from(subcategoryIds).map(id => Types.ObjectId.createFromHexString(id)) } } : {}),
      },
      page,
      size,
      options:{
        populate:['products', 'subcategories']
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
        populate:['products', 'subcategories']
      }
    })
    if(!result){
      throw new NotFoundException('Brand not found');
    }
    return result;
  }



  async update(categoryId: Types.ObjectId, updateCategoryDto: UpdateCategoryDto,user:UserDocument, file?:IMulterFile):Promise<CategoryDocument|Lean<CategoryDocument>> {
    const existing = await this.categoryRepository.findOne({
      filter: { _id: categoryId },
    });
    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    const dto = updateCategoryDto || {} as any;

    if(dto?.name && (await this.categoryRepository.findOne({filter:{name:dto.name}}))){
      throw new ConflictException('Category already exists');
    }
    
    const { removeBrands: _omitRemoveBrands, brands, __hasFiles: _omitHasFiles, ...restUpdate } = dto;
    
    let brandsUpdate: any = {};
    if (dto?.brands || dto?.removeBrands) {
      const updateBrandsRaw = dto.brands || [];
      const brandsToAdd: Types.ObjectId[] = [
        ...new Set(
          updateBrandsRaw.map((brand) =>
            Types.ObjectId.createFromHexString(brand as unknown as string)
          )
        ),
      ];
      if (brandsToAdd.length > 0 && (await this.brandRepository.find({ filter: { _id: { $in: brandsToAdd } } })).length !== brandsToAdd.length) {
        throw new BadRequestException('some of mentioned brands are not found');
      }
      const removeBrandsRaw = dto.removeBrands || [];
      const brandsToRemove: Types.ObjectId[] = [
        ...new Set(
          removeBrandsRaw.map((brand) =>
            Types.ObjectId.createFromHexString(brand as unknown as string)
          )
        ),
      ];
      
      brandsUpdate = {
        brands: {
          $setUnion: [
            {
              $setDifference: [
                "$brands",
                brandsToRemove.map((brand) => Types.ObjectId.createFromHexString(brand as unknown as string))
              ]
            },
            brandsToAdd.map((brand) => Types.ObjectId.createFromHexString(brand as unknown as string))
          ]
        }
      };
    }
    
    const updatePayload: any = {
      updatedBy: user._id,
      ...brandsUpdate
    };
    
    if (restUpdate && Object.keys(restUpdate).length > 0) {
      Object.assign(updatePayload, restUpdate);
    }
    
    if (file) {
      updatePayload.image = `/${file.finalPath}`;
    }
    
    const category=await this.categoryRepository.findOneAndUpdate({
      filter:{_id:categoryId},
      update: [
        {
          $set: updatePayload
        }
      ],
    })
    if(!category){
      throw new BadRequestException('category not found');
    }
    return category;
  }
  async freeze(categoryId: Types.ObjectId,user:UserDocument):Promise<string> {
const category=await this.categoryRepository.findOneAndUpdate({
  filter:{_id:categoryId},
  update:{freezedAt:new Date(),$unset:{restoredAt:true},updatedBy:user._id},options:{new:false},
})
if(!category){
  throw new BadRequestException('category not found');
}
return "Done";
   
  }
    async restore(categoryId: Types.ObjectId,user:UserDocument):Promise<CategoryDocument|Lean<CategoryDocument>> {
const category=await this.categoryRepository.findOneAndUpdate({
  filter:{_id:categoryId ,paranoId:false,freezedAt:{$exists:true}},
  update:{restoredAt:new Date(),$unset:{freezedAt:true},updatedBy:user._id},options:{new:false},
})
if(!category){
  throw new BadRequestException('category not found');
}
return category;
   
  }

  async remove(categoryId: Types.ObjectId,user:UserDocument):Promise<string> {
    const category=await this.categoryRepository.findOneAndDelete({
      filter:{_id:categoryId ,}
   
    })
    if(!category){
      throw new BadRequestException('category not found');
    }
    await this.productRepository.deleteMany({ category: categoryId } as any);
    return "Done";
       
  }

  async findOneWithProducts(
    categoryId: Types.ObjectId,
    query: SearchDto,
  ): Promise<{ category: CategoryDocument; products: any }> {
    const category = await this.categoryRepository.findOne({
      filter: { _id: categoryId },
      options: {
        populate: [
          { path: 'products' },
          { path: 'subcategories' }
        ],
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const { page, size, search } = query;
    const products = await this.productRepository.paginte({
      filter: {
        category: categoryId,
        ...(search
          ? {
              $or: [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
              ],
            }
          : {}),
      },
      page,
      size,
      options: {
        sort: { createdAt: -1 },
      },
    });

    return { category, products };
  }
}
