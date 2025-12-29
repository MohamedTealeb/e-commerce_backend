import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from 'src/DB/repository/category.repository';
import { UserDocument } from 'src/DB/model/user.model';
import { CategoryDocument } from 'src/DB/model/category.model';
import { Types } from 'mongoose';
import { AddSubcategoryDto } from './dto/add-subcategory.dto';

@Injectable()
export class SubcategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async add(
    categoryId: Types.ObjectId,
    addSubcategoryDto: AddSubcategoryDto,
    user: UserDocument,
  ): Promise<CategoryDocument> {
    const category = await this.categoryRepository.findOne({
      filter: { _id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const subcategoryIds = addSubcategoryDto.subcategoryIds;
    const subcategoryObjectIds = subcategoryIds.map((id) =>
      typeof id === 'string' ? Types.ObjectId.createFromHexString(id) : id,
    );

    // Verify all subcategories exist
    const existingSubcategories = await this.categoryRepository.find({
      filter: { _id: { $in: subcategoryObjectIds } },
    });
    if (existingSubcategories.length !== subcategoryObjectIds.length) {
      throw new BadRequestException('Some subcategories not found');
    }

    // Check for circular references
    if (subcategoryObjectIds.some((id) => id.equals(categoryId))) {
      throw new BadRequestException('Category cannot be its own subcategory');
    }

    // Get existing subcategories and merge with new ones
    const existingSubcategoryIds = (category.subcategories || []).map((sub: any) =>
      typeof sub === 'object' ? sub._id : sub,
    ) as Types.ObjectId[];

    const newSubcategoryIds = [
      ...new Set([
        ...existingSubcategoryIds.map((id) => id.toString()),
        ...subcategoryObjectIds.map((id) => id.toString()),
      ]),
    ].map((id) => Types.ObjectId.createFromHexString(id));

    const updatedCategory = await this.categoryRepository.findByIdAndUpdate({
      id: categoryId,
      update: {
        subcategories: newSubcategoryIds,
        hasSubcategories: true,
        updatedBy: user._id,
      },
    });

    if (!updatedCategory) {
      throw new BadRequestException('Failed to update category');
    }

    return updatedCategory;
  }

  async remove(
    categoryId: Types.ObjectId,
    subcategoryId: Types.ObjectId,
    user: UserDocument,
  ): Promise<CategoryDocument> {
    const category = await this.categoryRepository.findOne({
      filter: { _id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Verify subcategory exists
    const subcategory = await this.categoryRepository.findOne({
      filter: { _id: subcategoryId },
    });
    if (!subcategory) {
      throw new NotFoundException('Subcategory not found');
    }

    // Get existing subcategories
    const existingSubcategoryIds = (category.subcategories || []).map((sub: any) =>
      typeof sub === 'object' ? sub._id : sub,
    ) as Types.ObjectId[];

    // Check if subcategory is in the list
    const subcategoryExists = existingSubcategoryIds.some((id) => id.equals(subcategoryId));
    if (!subcategoryExists) {
      throw new BadRequestException('Subcategory is not associated with this category');
    }

    // Remove subcategory from list
    const updatedSubcategoryIds = existingSubcategoryIds
      .filter((id) => !id.equals(subcategoryId))
      .map((id) => id.toString())
      .map((id) => Types.ObjectId.createFromHexString(id));

    const updatedCategory = await this.categoryRepository.findByIdAndUpdate({
      id: categoryId,
      update: {
        subcategories: updatedSubcategoryIds,
        hasSubcategories: updatedSubcategoryIds.length > 0,
        updatedBy: user._id,
      },
    });

    if (!updatedCategory) {
      throw new BadRequestException('Failed to update category');
    }

    return updatedCategory;
  }

  async update(
    categoryId: Types.ObjectId,
    oldSubcategoryId: Types.ObjectId,
    newSubcategoryId: Types.ObjectId,
    user: UserDocument,
  ): Promise<CategoryDocument> {
    const category = await this.categoryRepository.findOne({
      filter: { _id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Verify both subcategories exist
    const oldSubcategory = await this.categoryRepository.findOne({
      filter: { _id: oldSubcategoryId },
    });
    if (!oldSubcategory) {
      throw new NotFoundException('Old subcategory not found');
    }

    const newSubcategory = await this.categoryRepository.findOne({
      filter: { _id: newSubcategoryId },
    });
    if (!newSubcategory) {
      throw new NotFoundException('New subcategory not found');
    }

    // Check for circular references
    if (newSubcategoryId.equals(categoryId)) {
      throw new BadRequestException('Category cannot be its own subcategory');
    }

    // Get existing subcategories
    const existingSubcategoryIds = (category.subcategories || []).map((sub: any) =>
      typeof sub === 'object' ? sub._id : sub,
    ) as Types.ObjectId[];

    // Check if old subcategory is in the list
    const oldSubcategoryExists = existingSubcategoryIds.some((id) => id.equals(oldSubcategoryId));
    if (!oldSubcategoryExists) {
      throw new BadRequestException('Old subcategory is not associated with this category');
    }

    // Check if new subcategory is already in the list
    const newSubcategoryExists = existingSubcategoryIds.some((id) => id.equals(newSubcategoryId));
    if (newSubcategoryExists) {
      throw new BadRequestException('New subcategory is already associated with this category');
    }

    // Replace old subcategory with new one
    const updatedSubcategoryIds = existingSubcategoryIds.map((id) => {
      if (id.equals(oldSubcategoryId)) {
        return newSubcategoryId;
      }
      return id;
    });

    const updatedCategory = await this.categoryRepository.findByIdAndUpdate({
      id: categoryId,
      update: {
        subcategories: updatedSubcategoryIds,
        hasSubcategories: true,
        updatedBy: user._id,
      },
    });

    if (!updatedCategory) {
      throw new BadRequestException('Failed to update category');
    }

    return updatedCategory;
  }
}