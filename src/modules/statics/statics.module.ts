import { Module } from '@nestjs/common';
import { StaticsController } from './statics.controller';
import { StaticsService } from './statics.service';
import { OrderRepository } from 'src/DB/repository/order.repository';
import { ProductRepository } from 'src/DB/repository/product.repository';
import { UserRepository } from 'src/DB/repository/user.repository';
import { CategoryRepository } from 'src/DB/repository/category.repository';
import { BrandRepository } from 'src/DB/repository/brand.repository';
import { OrderModel } from 'src/DB/model/oreder.model';
import { ProductModel } from 'src/DB/model/product.model';
import { UserModel } from 'src/DB/model/user.model';
import { CategoryModel } from 'src/DB/model/category.model';
import { BrandModel } from 'src/DB/model/brand.model';

@Module({
  imports: [OrderModel, ProductModel, UserModel, CategoryModel, BrandModel],
  controllers: [StaticsController],
  providers: [
    StaticsService,
    OrderRepository,
    ProductRepository,
    UserRepository,
    CategoryRepository,
    BrandRepository,
  ],
})
export class StaticsModule {}

