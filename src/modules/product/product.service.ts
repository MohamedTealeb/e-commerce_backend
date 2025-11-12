import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
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
    variants: any[] | any | undefined,
    productOriginalPrice?: number,
    productDiscountPercent?: number,
  ) {
    // Handle undefined or null
    if (variants === undefined || variants === null) return [];
    
    // If it's a single object (not array), convert it to array
    let variantsArray: any[] = [];
    if (Array.isArray(variants)) {
      variantsArray = variants;
    } else if (typeof variants === 'object' && variants !== null) {
      // Single variant object - convert to array
      variantsArray = [variants];
    } else {
      return [];
    }
    
    if (variantsArray.length === 0) return [];
    
    return variantsArray.map((vRaw: any) => {
      if (!vRaw || typeof vRaw !== 'object') return null;
      
      const {
        sku,
        originalPrice,
        discountPercent,
        salePrice,
        stock,
        attributes,
        size,
        color,
        ...rest
      } = vRaw || {};
      
      let attrs: Record<string, string> = {};
      
      // Handle attributes object
      if (attributes) {
        if (typeof attributes === 'object' && !Array.isArray(attributes)) {
          attrs = { ...attributes };
        }
      }
      
      // Add size and color directly if they exist as separate fields
      if (size && typeof size === 'string') {
        attrs.size = size;
      }
      if (color && typeof color === 'string') {
        attrs.color = color;
      }
      
      // Merge any string properties from rest into attributes (but exclude size and color as they're already handled)
      const stringProps = Object.fromEntries(
        Object.entries(rest)
          .filter(([key, val]) => typeof val === 'string' && key !== 'size' && key !== 'color') as [string, string][]
      );
      attrs = { ...attrs, ...stringProps };
      
      const op = typeof originalPrice === 'number' ? originalPrice : (typeof productOriginalPrice === 'number' ? productOriginalPrice : undefined);
      const dp = typeof discountPercent === 'number' ? discountPercent : (typeof productDiscountPercent === 'number' ? productDiscountPercent : 0);
      let sp: number | undefined = typeof salePrice === 'number' ? salePrice : undefined;
      if (typeof op === 'number') {
        const computed = op - (op * ((dp || 0) / 100));
        sp = typeof sp === 'number' ? sp : (computed > 0 ? computed : 1);
      }
      
      const variantStock = typeof stock === 'number' ? stock : 0;
      
      // Build variant object - Mongoose will automatically convert attributes object to Map
      const variant: any = {
        stock: variantStock,
      };
      
      if (sku) variant.sku = sku;
      if (Object.keys(attrs).length > 0) {
        // Pass as plain object - Mongoose schema will convert to Map automatically
        variant.attributes = attrs;
      }
      if (op !== undefined) variant.originalPrice = op;
      if (dp !== undefined && dp !== null) variant.discountPercent = dp;
      if (sp !== undefined) variant.salePrice = sp;
      
      return variant;
    }).filter((v) => v !== null && v !== undefined);
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
      const filesArr = Array.isArray(file) ? file : (file ? [file] : []);
      const images=filesArr.map(f=>`/${f.finalPath}`);
      // compute product level salePrice
      const computedSalePrice = (typeof originalPrice === 'number') ? (originalPrice - originalPrice*( (discountPercent ?? 0)/100)) : undefined;
      
      // Normalize variants - handle array, object, or string
      let variantsToNormalize: any = undefined;
      if (variants !== undefined && variants !== null) {
        if (Array.isArray(variants) || (typeof variants === 'object' && variants !== null)) {
          variantsToNormalize = variants;
        } else {
          // Handle string case (from form-data)
          const variantsValue = variants as any;
          if (typeof variantsValue === 'string' && variantsValue.trim() !== '') {
            try {
              const parsed = JSON.parse(variantsValue);
              variantsToNormalize = parsed; // Can be array or object
            } catch (e) {
              console.error('Failed to parse variants JSON:', e);
              variantsToNormalize = undefined;
            }
          }
        }
      }
      
      const normalizedVariants = this.normalizeVariants(variantsToNormalize, originalPrice, discountPercent);
      
      // Prepare product data
      const productData: any = {
        name,description,originalPrice,discountPercent,stock,
        
        category:category._id,
        salePrice: computedSalePrice && computedSalePrice>0 ? computedSalePrice : 1,
        images,
        createdBy:user._id,
      };
      
      // Always include variants array - Mongoose schema has default:[] so it will be saved
      productData.variants = normalizedVariants;
      
      const product=await this.productRepository.create({
        data: productData
      });
      if(!product){
        throw new BadRequestException('Failed to create product');
      }
      
      // Verify variants were saved
      const savedProduct = await this.productRepository.findOne({ filter: { _id: product._id } });
      if (savedProduct && savedProduct.variants) {
        console.log('Variants saved successfully:', JSON.stringify(savedProduct.variants, null, 2));
      }
      
      return product;
  }

  
  async update(
    productId: Types.ObjectId,
    updateProductDto: UpdateProductDto,
    user: UserDocument,
    files?: IMulterFile[],
  ) {
    const product = await this.productRepository.findOne({ filter: { _id: productId } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const updateDto = updateProductDto as any;
    if (updateDto.category) {
      const category = await this.categoryRepository.findOne({ filter: { _id: updateDto.category } });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      updateDto.category = category._id;
    }
    let salePrice = product.salePrice;
    if (updateDto.originalPrice || updateDto.discountPercent) {
      const mainPrice = updateDto.originalPrice ?? product.originalPrice;
      const discountPercent = updateDto.discountPercent ?? product.discountPercent;
      const finalPrice = mainPrice - (mainPrice * (discountPercent / 100));
      salePrice = finalPrice > 0 ? finalPrice : 1;
    }
    // Normalize variants if provided - can be array or single object
    let updatePayload: any = { ...updateDto };
    if (updateDto.variants !== undefined) {
      updatePayload.variants = this.normalizeVariants(
        updateDto.variants,
        updateDto.originalPrice ?? (product as any).originalPrice,
        updateDto.discountPercent ?? (product as any).discountPercent,
      );
    }
    // Handle images update if removedAttachments or files are provided
    if (updateDto.removedAttachments !== undefined || files?.length) {
      let images: string[] = Array.isArray(product.images) ? [...product.images] : [];
      const removed = updateDto.removedAttachments ?? [];
      if (removed.length) {
        const removedSet = new Set(removed);
        images = images.filter((img) => !removedSet.has(img));
      }
      if (files?.length) {
        // Replace old images with new ones instead of adding
        const newImages = files.map((file) => `/${file.finalPath}`);
        images = newImages;
      }
      updatePayload.images = images;
    }
    // Remove removedAttachments from update payload as it's not a product field
    delete updatePayload.removedAttachments;
    const updatedProduct = await this.productRepository.findOneAndUpdate({
      filter: { _id: productId },
      update: { ...updatePayload, salePrice, updatedBy: user._id },
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
      options:{
        populate:[
          {
            path:'category',
            select:'name slug description image'
          },
          {
            path:'brand',
            select:'name slug'
          },
          {
            path:'createdBy',
            select:'firstName lastName email'
          },
          {
            path:'updatedBy',
            select:'firstName lastName email'
          }
        ]
      }
    })
    return result;
  }
 async findOne(productId: Types.ObjectId,archive:boolean=false) {
    const product=await this.productRepository.findOne({
      filter:{_id:productId},
      options:{
        populate:[
          {
            path:'category',
            select:'name slug'
          },
          {
            path:'brand',
            select:'name slug'
          },
          {
            path:'createdBy',
            select:'firstName lastName email'
          },
          {
            path:'updatedBy',
            select:'firstName lastName email'
          }
        ]
      }
    });
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
