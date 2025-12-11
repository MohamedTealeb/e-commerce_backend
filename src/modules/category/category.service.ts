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
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly brandRepository: BrandRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, file: IMulterFile, user: UserDocument): Promise<CategoryDocument> {
    const { name } = createCategoryDto;
    const checkCategory = await this.categoryRepository.findOne({ filter: { name, paranoId: false } });
    if (checkCategory) {
      throw new ConflictException(
        checkCategory.freezedAt ? 'Duplicated with archived category' : 'Duplicated category name',
      );
    }

    const image: string = file ? `/${file.finalPath}` : '';
    const subcategoriesRaw = createCategoryDto.subcategories || [];
    let subcategories: Types.ObjectId[] = [];
    if (subcategoriesRaw.length) {
      subcategories = [
        ...new Set(
          subcategoriesRaw.map((subcategory) =>
            Types.ObjectId.createFromHexString(subcategory as unknown as string),
          ),
        ),
      ];
      const foundSubcategories = await this.categoryRepository.find({
        filter: { _id: { $in: subcategories } } as any,
      });
      if (foundSubcategories.length !== subcategories.length) {
        throw new BadRequestException('some of mentioned subcategories are not found');
      }
    }

    const category = await this.categoryRepository.create({
      data: {
        ...createCategoryDto,
        hasSubcategories:
          subcategories.length > 0
            ? true
            : typeof createCategoryDto.hasSubcategories === 'boolean'
            ? createCategoryDto.hasSubcategories
            : false,
        subcategories,
        image,
        createdBy: user._id,
      },
    });
    return category;
  }

  async findAll(data: SearchDto, archive: boolean = false) {
    const { page, size, search } = data;
    const result = await this.categoryRepository.paginte({
      filter: {
        ...(search
          ? {
              $or: [
                { name: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } },
                { slogan: { $regex: search, $options: 'i' } },
              ],
            }
          : {}),
        ...(archive ? { paranoId: false, freezedAt: { $exists: true } } : {}),
      },
      page,
      size,
      options: {
        populate: [
          {
            path: 'products',
            populate: [
              {
                path: 'brand',
                select: 'name slug',
              },
              {
                path: 'createdBy',
                select: 'firstName lastName email',
              },
              {
                path: 'updatedBy',
                select: 'firstName lastName email',
              },
            ],
          },
          {
            path: 'subcategories',
            select: 'name slug description image hasSubcategories',
            populate: {
              path: 'products',
              populate: [
                {
                  path: 'brand',
                  select: 'name slug',
                },
                {
                  path: 'createdBy',
                  select: 'firstName lastName email',
                },
                {
                  path: 'updatedBy',
                  select: 'firstName lastName email',
                },
              ],
            },
          },
        ],
      },
    });
    return result;
  }

  async findOne(categoryId: Types.ObjectId, archive: boolean = false) {
    const result = await this.categoryRepository.findOne({
      filter: {
        _id: categoryId,
        ...(archive ? { paranoId: false, freezedAt: { $exists: true } } : {}),
      },
      options: {
        populate: [
          {
            path: 'products',
            populate: [
              {
                path: 'brand',
                select: 'name slug',
              },
              {
                path: 'createdBy',
                select: 'firstName lastName email',
              },
              {
                path: 'updatedBy',
                select: 'firstName lastName email',
              },
            ],
          },
          {
            path: 'subcategories',
            select: 'name slug description image hasSubcategories',
            populate: {
              path: 'products',
              populate: [
                {
                  path: 'brand',
                  select: 'name slug',
                },
                {
                  path: 'createdBy',
                  select: 'firstName lastName email',
                },
                {
                  path: 'updatedBy',
                  select: 'firstName lastName email',
                },
              ],
            },
          },
        ],
      },
    });
    if (!result) {
      throw new NotFoundException('Category not found');
    }
    return result;
  }

  /**
   * Find one category and return its products with pagination
   */
  async findOneWithProducts(
    categoryId: Types.ObjectId,
    data: SearchDto,
    archive: boolean = false,
  ) {
    const category = await this.categoryRepository.findOne({
      filter: {
        _id: categoryId,
        ...(archive ? { paranoId: false, freezedAt: { $exists: true } } : {}),
      },
      options: {
        populate: [
          {
            path: 'subcategories',
            select: 'name slug description image hasSubcategories',
            populate: {
              path: 'products',
              populate: [
                {
                  path: 'brand',
                  select: 'name slug',
                },
                {
                  path: 'createdBy',
                  select: 'firstName lastName email',
                },
                {
                  path: 'updatedBy',
                  select: 'firstName lastName email',
                },
              ],
            },
          },
        ],
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const { page, size } = data || ({} as SearchDto);
    const pageArg: number | 'all' = typeof page === 'number' ? page : 'all';

    const products = await this.productRepository.paginte({
      filter: {
        category: category._id as any,
      } as any,
      page: pageArg,
      size,
      options: {
        populate: [
          {
            path: 'brand',
            select: 'name slug',
          },
          {
            path: 'createdBy',
            select: 'firstName lastName email',
          },
          {
            path: 'updatedBy',
            select: 'firstName lastName email',
          },
        ],
      } as any,
    });

    return { category, products };
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
    
    const { removeBrands: _omitRemoveBrands, brands, __hasFiles: _omitHasFiles, subcategories, ...restUpdate } = dto;
    
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
    
    let subcategoriesUpdate: any = {};
    if (subcategories !== undefined) {
      const subcategoriesRaw = subcategories || [];
      const subcategoriesToSet: Types.ObjectId[] = [
        ...new Set(
          subcategoriesRaw.map((subcategory: any) =>
            Types.ObjectId.createFromHexString(subcategory as unknown as string),
          ),
        ),
      ];
      if (
        subcategoriesToSet.length > 0 &&
        (await this.categoryRepository.find({ filter: { _id: { $in: subcategoriesToSet } } as any })).length !==
          subcategoriesToSet.length
      ) {
        throw new BadRequestException('some of mentioned subcategories are not found');
      }
      subcategoriesUpdate = {
        subcategories: subcategoriesToSet,
      };
      // Always sync hasSubcategories with provided subcategories unless explicitly overridden
      if (restUpdate.hasSubcategories === undefined) {
        subcategoriesUpdate.hasSubcategories = subcategoriesToSet.length > 0;
      }
    }
    
    const updatePayload: any = {
      updatedBy: user._id,
      ...brandsUpdate,
      ...subcategoriesUpdate
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
}
