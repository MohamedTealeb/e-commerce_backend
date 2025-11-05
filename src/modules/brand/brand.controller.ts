import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipe, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { BrandParamsDto, GetAllDto, UpdateBrandDto } from './dto/update-brand.dto';
import { succesResponse } from 'src/common/utils/response';
import { User } from 'src/common/decoretors/credential.decorator';
import type { UserDocument } from 'src/DB/model/user.model';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidation } from 'src/common/utils/multer/validation.multer';
import { IResponse } from 'src/common/interfaces/response.interfae';
import { BrandResponse } from './entities/brand.entity';
import { RoleEnum } from 'src/common/enums/user.enum';
import { Auth } from 'src/common/decoretors/auth.decoretors';
import { endpoint } from './brand.authorization.module';
import { localFileUpload } from 'src/common/utils/multer/local.multer';
import type { IMulterFile } from 'src/common/interfaces/multer.interface';
import { BrandDocument } from 'src/DB/model/brand.model';
import { Lean } from 'src/DB/repository/database.repository';
import { SearchDto } from 'src/common/dtos/search.dto';
import { GetAllResponse } from 'src/common/entities/search.entity';

@UsePipes(new ValidationPipe({whitelist:true ,forbidNonWhitelisted:true}))
@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  
  @UseInterceptors(FileInterceptor('attachment',localFileUpload({folder:'brands',vaildation:FileValidation.image})))
  @Auth(endpoint.create)
  @Post()
  async create(
    @User() user:UserDocument,
    @Body() createBrandDto: CreateBrandDto,
    @UploadedFile(ParseFilePipe)  file:IMulterFile
  ):Promise<IResponse<BrandResponse>> {
    const brand= await this.brandService.create(createBrandDto,file,user);
    return succesResponse <BrandResponse>({
      data:{brand},
      message:"Brand created successfully",
      status:201
    })
  }

  @Get()
 async findAll(@Query()  query:SearchDto):Promise<IResponse<GetAllResponse<BrandResponse>>> {
   const result = await this.brandService.findAll(query);
   const mapped: GetAllResponse<BrandResponse> = {
    result: {
      docsCount: (result as any).docsCount || 0,
      limit: (result as any).limit || 0,
      pages: (result as any).pages || 0,
      currentPage: (result as any).currentPage || 1,
      result: ((result as any).result || []).map((doc: any) => ({ brand: doc })),
    },
  };
   return succesResponse<GetAllResponse<BrandResponse>>({data: mapped})
  }
@Auth(endpoint.create)
  @Get('/archive')
async findAllArchive(
  @Query()  query:SearchDto,
) {
  const result = await this.brandService.findAll(query,true);
  return succesResponse({data:result})
}
  @Get(':brandId')
  async findOne(@Param() params: BrandParamsDto): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.findOne(params.brandId);
    return succesResponse<BrandResponse>({data:{brand},message:"Brand found successfully",status:200})
  }

  @Auth(endpoint.create)
  @Get(':brandId/archive')
  findOneArchive(@Param() params: BrandParamsDto) {
    return this.brandService.findOne(params.brandId,true);
  }

  @Auth(endpoint.create)
  @Patch(':brandId')
 async update(@Param() params: BrandParamsDto, @Body() updateBrandDto: UpdateBrandDto, @User() user:UserDocument):Promise<IResponse<BrandResponse>> {
    const brand=await this.brandService.update(params.brandId, updateBrandDto,user);
    return succesResponse<BrandResponse>({data:{brand},message:"Brand updated successfully",status:200})
  }
  @UseInterceptors(FileInterceptor('attachment',localFileUpload({folder:'brands',vaildation:FileValidation.image})))
  @Auth(endpoint.create)
  @Patch(':brandId/attachment')
 async updateAttachment(@Param() params: BrandParamsDto, @UploadedFile(ParseFilePipe) file:IMulterFile, @User() user:UserDocument):Promise<IResponse<BrandResponse>> {
    const brand=await this.brandService.updateAttachment(params.brandId, file,user);
    return succesResponse<BrandResponse>({data:{brand},message:"Brand updated successfully",status:200})
  }

  @Auth(endpoint.create)
  @Delete(':brandId/freeze')
  async freeze(@Param() params: BrandParamsDto , @User() user:UserDocument):Promise<string> {
    await this.brandService.freeze(params.brandId,user);
    return "Done";
  }
  @Auth(endpoint.create)
  @Patch(':brandId/restore')
  async restore(@Param() params: BrandParamsDto , @User() user:UserDocument):Promise<IResponse<BrandResponse>> {
 const brand=   await this.brandService.restore(params.brandId,user);
    return succesResponse<BrandResponse>({data:{brand},message:"Brand restored successfully",status:200})

  }


  @Auth(endpoint.create)
  @Delete(':brandId')
  async remove(@Param() params: BrandParamsDto , @User() user:UserDocument):Promise<IResponse<string>> {
    const result = await this.brandService.remove(params.brandId,user);
    return succesResponse<string>({data:result,message:"Brand removed successfully",status:200});
  }
}