import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipe, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { CategoryParamsDto, GetAllDto, UpdateCategoryDto } from './dto/update-category.dto';
import { succesResponse } from 'src/common/utils/response';
import { User } from 'src/common/decoretors/credential.decorator';
import type { UserDocument } from 'src/DB/model/user.model';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidation } from 'src/common/utils/multer/validation.multer';
import { IResponse } from 'src/common/interfaces/response.interfae';
import { CategoryResponse } from './entities/category.entity';

import { Auth } from 'src/common/decoretors/auth.decoretors';
import { endpoint } from './category.authorization.module';
import { localFileUpload } from 'src/common/utils/multer/local.multer';
import type { IMulterFile } from 'src/common/interfaces/multer.interface';
import { CategoryService } from './category.service';
import { AddFilesFlagInterceptor } from 'src/common/interceptors/add-files-flag.interceptor';

import { CreateCategoryDto } from './dto/create-category.dto';
import { SearchDto } from 'src/common/dtos/search.dto';
import { GetAllResponse } from 'src/common/entities/search.entity';


@UsePipes(new ValidationPipe({whitelist:true ,forbidNonWhitelisted:true}))
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  
  @UseInterceptors(FileInterceptor('attachment',localFileUpload({folder:'categories',vaildation:FileValidation.image})))
  @Auth(endpoint.create)
  @Post()
  async create(
    @User() user:UserDocument,
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile(ParseFilePipe)  file:IMulterFile
  ):Promise<IResponse<CategoryResponse>> {
    const category= await this.categoryService.create(createCategoryDto,file,user);
    return succesResponse <CategoryResponse>({
      data:{category},
      message:"Category created successfully",
      status:201
    })
  }

  @Get()
 async findAll(@Query()  query:SearchDto):Promise<IResponse<GetAllResponse<CategoryResponse>>> {
  const result = await this.categoryService.findAll(query);
  const mapped: GetAllResponse<CategoryResponse> = {
    result: {
      docsCount: (result as any).docsCount || 0,
      limit: (result as any).limit || 0,
      pages: (result as any).pages || 0,
      currentPage: (result as any).currentPage || 1,
      result: ((result as any).result || []).map((doc: any) => ({ category: doc })),
    },
  };
   return succesResponse<GetAllResponse<CategoryResponse>>({data: mapped})
 }
@Auth(endpoint.create)
  @Get('/archive')
async findAllArchive(
  @Query()  query:SearchDto,
) {
  const result = await this.categoryService.findAll(query,true);
  return succesResponse({data:result})
}
  @Get(':categoryId')
  async findOne(@Param() params: CategoryParamsDto): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.findOne(params.categoryId);
    return succesResponse<CategoryResponse>({data:{category},message:"Category found successfully",status:200})
  }

  @Auth(endpoint.create)
  @Get(':categoryId/archive')
  findOneArchive(@Param() params: CategoryParamsDto) {
    return this.categoryService.findOne(params.categoryId,true);
  }

  @UseInterceptors(FileInterceptor('attachment',localFileUpload({folder:'categories',vaildation:FileValidation.image})), AddFilesFlagInterceptor)
  @Auth(endpoint.create)
  @Patch(':categoryId')
 async update(@Param() params: CategoryParamsDto, @Body() updateCategoryDto: UpdateCategoryDto, @User() user:UserDocument, @UploadedFile() file?:IMulterFile):Promise<IResponse<CategoryResponse>> {
    const category=await this.categoryService.update(params.categoryId, updateCategoryDto,user, file);
    return succesResponse<CategoryResponse>({data:{category},message:"Category updated successfully",status:200})
  }

  @Auth(endpoint.create)
  @Delete(':categoryId/freeze')
  async freeze(@Param() params: CategoryParamsDto , @User() user:UserDocument):Promise<string> {
    await this.categoryService.freeze(params.categoryId,user);
    return "Done";
  }
  @Auth(endpoint.create)
  @Patch(':categoryId/restore')
  async restore(@Param() params: CategoryParamsDto , @User() user:UserDocument):Promise<IResponse<CategoryResponse>> {
 const category=   await this.categoryService.restore(params.categoryId,user);
    return succesResponse<CategoryResponse>({data:{category},message:"Category restored successfully",status:200})

  }


  @Auth(endpoint.create)
  @Delete(':categoryId')
  async remove(@Param() params: CategoryParamsDto , @User() user:UserDocument):Promise<IResponse<string>> {
    const result = await this.categoryService.remove(params.categoryId,user);
    return succesResponse<string>({data:result,message:"Category removed successfully",status:200});
  }
}