import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductAttachmentDto, UpdateProductDto } from './dto/update-product.dto';
import { UserDocument } from 'src/DB/model/user.model';
import { ProductRepository } from 'src/DB/repository/product.repository';
import { CategoryRepository } from 'src/DB/repository/category.repository';
import { BrandRepository } from 'src/DB/repository/brand.repository';
import { randomUUID } from 'crypto';
import type { IMulterFile } from 'src/common/interfaces/multer.interface';
import { ProductDocument } from 'src/DB/model/product.model';
import { Types } from 'mongoose';
import { SearchDto } from 'src/common/dtos/search.dto';
import { UserRepository } from 'src/DB/repository/user.repository';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository,
    private readonly brandRepository: BrandRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly userRepository: UserRepository) {}
  private normalizeVariants(
    variants: any[] | undefined,
    productOriginalPrice?: number,
    productDiscountPercent?: number,
  ) {
    if (!Array.isArray(variants)) return [] as any[];
    return variants.map((vRaw: any) => {
      const {
        sku,
        originalPrice,
        discountPercent,
        salePrice,
        stock,
        attributes,
        ...rest
      } = vRaw || {};
      const attrs: Record<string, string> = {
        ...(attributes || {}),
        ...Object.fromEntries(
          Object.entries(rest)
            .filter(([, val]) => typeof val === 'string') as [string, string][]
        ),
      };
      const op = typeof originalPrice === 'number' ? originalPrice : (typeof productOriginalPrice === 'number' ? productOriginalPrice : undefined);
      const dp = typeof discountPercent === 'number' ? discountPercent : (typeof productDiscountPercent === 'number' ? productDiscountPercent : 0);
      let sp: number | undefined = typeof salePrice === 'number' ? salePrice : undefined;
      if (typeof op === 'number') {
        const computed = op - (op * ((dp || 0) / 100));
        sp = typeof sp === 'number' ? sp : (computed > 0 ? computed : 1);
      }
      return {
        sku,
        attributes: attrs,
        originalPrice: op,
        discountPercent: dp,
        salePrice: sp,
        stock: typeof stock === 'number' ? stock : 0,
      };
    });
  }

 async create(createProductDto: CreateProductDto ,file:IMulterFile[],user:UserDocument):Promise<ProductDocument> {
  const {name,description,originalPrice,discountPercent,stock,variants}=createProductDto;
      const category=await this.categoryRepository.findOne({filter:{_id:createProductDto.category}});
      if(!category){
        throw new NotFoundException('Category not found');
      }
      const brand = createProductDto.brand
        ? await this.brandRepository.findOne({ filter: { _id: createProductDto.brand } })
        : null;
      let assetFolderId:string=randomUUID();
      const filesArr = Array.isArray(file) ? file : (file ? [file] : []);
      const images=filesArr.map(f=>`${assetFolderId}/${f.finalPath}`);
      // compute product level salePrice
      const computedSalePrice = (typeof originalPrice === 'number') ? (originalPrice - originalPrice*( (discountPercent ?? 0)/100)) : undefined;
      const normalizedVariants = this.normalizeVariants(variants as any[], originalPrice, discountPercent);
      const product=await this.productRepository.create({
        data:{
          name,description,originalPrice,discountPercent,stock,
          ...(brand? { brand: brand._id } : {}),
          category:category._id,
          salePrice: computedSalePrice && computedSalePrice>0 ? computedSalePrice : 1,
          variants: normalizedVariants,
          images,
          createdBy:user._id,
        }
      });
      if(!product){
        throw new BadRequestException('Failed to create product');
      }
      return product;
  }

  
  async  update(productId: Types.ObjectId, updateProductDto: UpdateProductDto, user:UserDocument){
    const product=await this.productRepository.findOne({filter:{_id:productId}});
    if(!product){
      throw new NotFoundException('Product not found');
    }
    if(updateProductDto.category){
      const category=await this.categoryRepository.findOne({filter:{_id:updateProductDto.category}});
      if(!category){
        throw new NotFoundException('Category not found');
      }
      updateProductDto.category=category._id;
    }
    if(updateProductDto.brand){
      const brand=await this.brandRepository.findOne({filter:{_id:updateProductDto.brand}});
      if(!brand){
        throw new NotFoundException('Brand not found');
      }
      updateProductDto.brand=brand._id;
    }
    let salePrice=product.salePrice
    if(updateProductDto.originalPrice||updateProductDto.discountPercent) {
      const mainPrice=updateProductDto.originalPrice??product.originalPrice;
      const discountPercent=updateProductDto.discountPercent??product.discountPercent;
      const finalPrice=mainPrice-(mainPrice*(discountPercent/100));
      salePrice=finalPrice>0?finalPrice:1;
    }
    // Normalize variants if provided
    let updatePayload: any = { ...updateProductDto };
    if ((updateProductDto as any).variants) {
      updatePayload.variants = this.normalizeVariants(
        (updateProductDto as any).variants as any[],
        updateProductDto.originalPrice ?? (product as any).originalPrice,
        updateProductDto.discountPercent ?? (product as any).discountPercent,
      );
    }
    const updatedProduct=await this.productRepository.findOneAndUpdate({
      filter:{_id:productId},
      update:{...updatePayload,salePrice,updatedBy:user._id},
    });
    if(!updatedProduct){
      throw new BadRequestException('Failed to update product');
    }
    return updatedProduct;
  }
  async updateAttachment(
    productId: Types.ObjectId,
    updateProductAttachmentDto: UpdateProductAttachmentDto,
    user: UserDocument,
    files?: IMulterFile[],
  ) {
    const product = await this.productRepository.findOne({
      filter: { _id: productId },
      options: { populate: [{ path: 'category' }] },
    });
  
    if (!product) {
      throw new NotFoundException('Product not found');
    }
  
    let images: string[] = Array.isArray(product.images) ? [...product.images] : [];
    const removed = updateProductAttachmentDto?.removedAttachments ?? [];
  
    if (removed.length) {
      const removedSet = new Set(removed);
      images = images.filter((img) => !removedSet.has(img));
    }
  
    if (files?.length) {
      const newImages = files.map((file) => `/${file.finalPath}`);
      images = images.concat(newImages);
    }
  
    const updatedProduct = await this.productRepository.findOneAndUpdate({
      filter: { _id: productId },
      update: {
        $set: {
          updatedBy: user._id,
          images,
        },
      },
    });
  
    if (!updatedProduct) {
      throw new BadRequestException('Failed to update product');
    }
  
    return updatedProduct;
  }
  
  
 async findAll(data:SearchDto,archive:boolean=false) {
  const{page,size,search}=data;
    const result=await this.productRepository.paginte({
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
 async findOne(productId: Types.ObjectId,archive:boolean=false) {
    const product=await this.productRepository.findOne({filter:{_id:productId}});
    if(!product){
      throw new NotFoundException('Product not found');
    }
    return product;
  }
 async addToWishlist(productId: Types.ObjectId,user:UserDocument) {
    const product=await this.productRepository.findOne({filter:{_id:productId}});
    if(!product){
      throw new NotFoundException('Product not found');
    }
    await this.userRepository.updateOne({filter:{_id:user._id},update:{$addToSet:{wishlist:product._id}}});
    return product;
  }
 async removeFromWishlist(productId: Types.ObjectId,user:UserDocument) {
    const product=await this.productRepository.findOne({filter:{_id:productId}});
    if(!product){
      throw new NotFoundException('Product not found');
    }
    await this.userRepository.updateOne({filter:{_id:user._id},update:{$pull:{wishlist:Types.ObjectId.createFromHexString(productId as unknown as string)}}});
    return "product removed from wishlist successfully";
  }




 
  async freeze(productId: Types.ObjectId,user:UserDocument):Promise<string> {
const product=await this.productRepository.findOneAndUpdate({
  filter:{_id:productId},
  update:{freezedAt:new Date(),$unset:{restoredAt:true},updatedBy:user._id},options:{new:false},
})
if(!product){
  throw new BadRequestException('Failed to freeze product');
}
return "Done";
   
  }
    async restore(productId: Types.ObjectId,user:UserDocument):Promise<ProductDocument> {
const product=await this.productRepository.findOneAndUpdate({
  filter:{_id:productId ,paranoId:false,freezedAt:{$exists:true}},
  update:{restoredAt:new Date(),$unset:{freezedAt:true},updatedBy:user._id},options:{new:false},
})
if(!product){
  throw new BadRequestException('Failed to restore category');
}
return product;
   
  }

  async remove(productId: Types.ObjectId,user:UserDocument):Promise<string> {
    const product=await this.productRepository.findOneAndDelete({
      filter:{_id:productId ,}
   
    })
    if(!product){
      throw new BadRequestException('Failed to remove product');
    }
    return "Done";
       
      }
}
