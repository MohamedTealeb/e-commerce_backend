import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, UsePipes, ValidationPipe, ParseFilePipe, Query, Inject } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductParamsDto, UpdateProductAttachmentDto, UpdateProductDto } from './dto/update-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { localFileUpload } from 'src/common/utils/multer/local.multer';
import { FileValidation } from 'src/common/utils/multer/validation.multer';
import { endpoint } from './authorization';
import { Auth } from 'src/common/decoretors/auth.decoretors';
import { User } from 'src/common/decoretors/credential.decorator';
import type { UserDocument } from 'src/DB/model/user.model';
import type { IMulterFile } from 'src/common/interfaces/multer.interface';
import { succesResponse } from 'src/common/utils/response';
import { ProductResponse } from './entities/product.entity';
import { IResponse } from 'src/common/interfaces/response.interfae';
import { SearchDto } from 'src/common/dtos/search.dto';
import { ProductDocument } from 'src/DB/model/product.model';
import { GetAllResponse } from 'src/common/entities/search.entity';
import { RoleEnum } from 'src/common/enums/user.enum';
import { CACHE_MANAGER ,Cache, CacheInterceptor, CacheTTL} from '@nestjs/cache-manager';

@UsePipes(new ValidationPipe({whitelist:true ,forbidNonWhitelisted:true}))
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService,@Inject(CACHE_MANAGER) private cacheManager:Cache) {}
@UseInterceptors(FilesInterceptor('attachment', 10, localFileUpload({folder:'products',vaildation:FileValidation.image})))
@Auth(endpoint.create)
@Post()
  async create
  ( @User() user:UserDocument,
  @UploadedFiles() files:IMulterFile[] ,
    @Body() createProductDto: CreateProductDto):Promise<IResponse<ProductResponse>> {
     const product=await   this.productService.create(createProductDto,files,user);
    return succesResponse<ProductResponse>({status:201,data:{product},message:'Product created successfully'})
  }

  @Get()
  async findAll(@Query() query: SearchDto):Promise<IResponse<GetAllResponse<ProductResponse>>> {
    const result=await this.productService.findAll(query,false);
    return succesResponse<GetAllResponse<ProductResponse>>({data:{result:{
      docsCount:result.docsCount,
      limit:result.limit,
      pages:result.pages,
      currentPage:result.currentPage,
      result:result.result.map((product:ProductDocument)=>({product})),
    }},message:"Products found successfully",status:200})
  }

  @Get(':productId')
 async findOne(@Param() params: ProductParamsDto):Promise<IResponse<ProductResponse>> {
    const product=await this.productService.findOne(params.productId);
    return succesResponse<ProductResponse>({data:{product},message:"Product found successfully",status:200})
  }
@Auth(endpoint.create)
  @Patch(':productId')
  async update(@Param() params: ProductParamsDto, @Body() updateProductDto: UpdateProductDto, @User() user:UserDocument):Promise<IResponse<ProductResponse>> {
    const product=await this.productService.update(params.productId, updateProductDto,user);
    return succesResponse<ProductResponse>({data:{product},message:"Product updated successfully",status:200})
  }
  @UseInterceptors(FilesInterceptor('attachment', 10, localFileUpload({folder:'products',vaildation:FileValidation.image})))

@Auth(endpoint.create)
  @Patch(':productId/attachment')
  async updateAttachment(@Param() params: ProductParamsDto, @Body() updateProductAttachmentDto: UpdateProductAttachmentDto, @User() user:UserDocument ,@UploadedFiles() files?:IMulterFile[]):Promise<IResponse<ProductResponse>> {
    const product=await this.productService.updateAttachment(params.productId, updateProductAttachmentDto,user,files);
    return succesResponse<ProductResponse>({data:{product},message:"Product updated successfully",status:200})
  }

  @Delete(':productId')
  async remove(@Param() params: ProductParamsDto, @User() user:UserDocument):Promise<IResponse<string>> {
    const result=await this.productService.remove(params.productId,user);
    return succesResponse<string>({data:result,message:"Product removed successfully",status:200})
  }
  @Auth(endpoint.create)
  @Patch(':productId/freeze')
  async freeze(@Param() params: ProductParamsDto, @User() user:UserDocument):Promise<IResponse<string>> {
    const result=await this.productService.freeze(params.productId,user);
    return succesResponse<string>({data:result,message:"Product frozen successfully",status:200})
  }
  @Auth(endpoint.create)
  @Patch(':productId/restore')
  async restore(@Param() params: ProductParamsDto, @User() user:UserDocument):Promise<IResponse<ProductResponse>> {
    const product=await this.productService.restore(params.productId,user);
    return succesResponse<ProductResponse>({data:{product},message:"Product restored successfully",status:200})
  }
  
  @CacheTTL(10000)
  @UseInterceptors(CacheInterceptor)
  @Get("test")
  async test(){
    let user=await this.cacheManager.get("user")
    if(!user){
      user={message:`Done at ${ Date.now()},`,name:"mohamed"}
      await this.cacheManager.set("user",user,25000)
    }
    return user;
  }

@Auth([RoleEnum.USER])
  @Patch(":productId/add-to-wishlist")
 async addToWishlist(@Param() params: ProductParamsDto, @User() user:UserDocument) {

  const product=await this.productService.addToWishlist(params.productId,user)
  return succesResponse<ProductResponse>({data:{product},message:"Product added to wishlist successfully",status:200})
  }
  @Auth([RoleEnum.USER])
  @Patch(":productId/remove-from-wishlist")
  async removeFromWishlist(@Param() params: ProductParamsDto, @User() user:UserDocument) {
    await this.productService.removeFromWishlist(params.productId,user);
    return succesResponse({data:{},message:"Product removed from wishlist successfully",status:200})
  }
}
