import { Types } from "mongoose";
import { ICategory } from "./category.interface";
import { IBrand } from "./brand.interface";
import { IUser } from "./user.interfaces";



export interface IProduct {
    _id?:Types.ObjectId,
  name: string;
  slug: string;
  description?: string;
  images:string[];
  originalPrice: number;
  discountPercent: number;
  salePrice: number;
  stock:number;
  soldItems:number;
  category:Types.ObjectId | ICategory;
  brand?:Types.ObjectId | IBrand;
  createdBy:Types.ObjectId | IUser;
  updatedBy?:Types.ObjectId | IUser;

  createdAt?:Date;
  updatedAt?:Date;

  freezedAt?:Date;
  restoredAt?:Date;

  variants?: Array<{
    sku?: string;
    attributes?: Record<string, string>;
    originalPrice?: number;
    discountPercent?: number;
    salePrice?: number;
    stock: number;
  }>;
}