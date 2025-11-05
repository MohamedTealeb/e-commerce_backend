import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryRepository } from 'src/DB/repository/category.repository';
import { BrandRepository } from 'src/DB/repository/brand.repository';
import { ProductRepository } from 'src/DB/repository/product.repository';
import { BrandModel } from 'src/DB/model/brand.model';
import { CategoryModel } from 'src/DB/model/category.model';
import { ProductModel } from 'src/DB/model/product.model';
import { TokenSecurity } from 'src/common/utils/security/token.security';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { AuthorizationGuard } from 'src/common/guards/authorization/authorization.guard';
import { UserModule } from 'src/modules/user/user.module';

@Module({
  imports: [
    BrandModel,
    CategoryModel,
    ProductModel,
    UserModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600') },
    }),
  ],
  controllers: [CategoryController ],
  providers: [
    CategoryService,
    BrandRepository,
    ProductRepository,
    CategoryRepository,
    TokenSecurity,
    AuthenticationGuard,
    AuthorizationGuard,
  ],
})
export class CategoryModule {}
