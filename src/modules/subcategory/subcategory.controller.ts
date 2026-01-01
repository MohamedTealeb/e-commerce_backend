import { Controller, Post, Delete, Patch, Param, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { SubcategoryService } from './subcategory.service';
import { AddSubcategoryDto, AddSubcategoryParamsDto, SubcategoryParamsDto } from './dto/add-subcategory.dto';
import { UpdateSubcategoryParamsDto, UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { succesResponse } from 'src/common/utils/response';
import { User } from 'src/common/decoretors/credential.decorator';
import type { UserDocument } from 'src/DB/model/user.model';
import { IResponse } from 'src/common/interfaces/response.interfae';
import { SubcategoryResponse } from './entities/subcategory.entity';
import { Auth } from 'src/common/decoretors/auth.decoretors';
import { endpoint } from 'src/modules/category/category.authorization.module';
import { Types } from 'mongoose';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('subcategory')
export class SubcategoryController {
  constructor(private readonly subcategoryService: SubcategoryService) {}

  @Auth(endpoint.create)
  @Post(':categoryId')
  async add(
    @Param() params: AddSubcategoryParamsDto,
    @Body() addSubcategoryDto: AddSubcategoryDto,
    @User() user: UserDocument,
  ): Promise<IResponse<SubcategoryResponse>> {
    const category = await this.subcategoryService.add(
      params.categoryId,
      addSubcategoryDto,
      user,
    );
    return succesResponse<SubcategoryResponse>({
      data: { category },
      message: 'Subcategories added successfully',
      status: 200,
    });
  }

  @Auth(endpoint.create)
  @Delete(':categoryId/:subcategoryId')
  async remove(
    @Param() params: SubcategoryParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse<SubcategoryResponse>> {
    const category = await this.subcategoryService.remove(
      params.categoryId,
      params.subcategoryId,
      user,
    );
    return succesResponse<SubcategoryResponse>({
      data: { category },
      message: 'Subcategory removed successfully',
      status: 200,
    });
  }

  @Auth(endpoint.create)
  @Patch(':categoryId/:subcategoryId')
  async update(
    @Param() params: UpdateSubcategoryParamsDto,
    @Body() updateSubcategoryDto: UpdateSubcategoryDto,
    @User() user: UserDocument,
  ): Promise<IResponse<SubcategoryResponse>> {
    const category = await this.subcategoryService.update(
      params.categoryId,
      params.subcategoryId,
      Types.ObjectId.createFromHexString(updateSubcategoryDto.newSubcategoryId),
      user,
    );
    return succesResponse<SubcategoryResponse>({
      data: { category },
      message: 'Subcategory updated successfully',
      status: 200,
    });
  }
}
