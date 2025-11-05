import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductRepository } from 'src/DB/repository/product.repository';
import { BrandRepository } from 'src/DB/repository/brand.repository';
import { CategoryRepository } from 'src/DB/repository/category.repository';
import { ProductModel } from 'src/DB/model/product.model';
import { BrandModel } from 'src/DB/model/brand.model';
import { CategoryModel } from 'src/DB/model/category.model';
import { TokenSecurity } from 'src/common/utils/security/token.security';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { AuthorizationGuard } from 'src/common/guards/authorization/authorization.guard';
import { UserModule } from 'src/modules/user/user.module';

@Module({
  imports: [
    ProductModel,
    BrandModel,
    CategoryModel,
    UserModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600') },
    }),
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductRepository,
    BrandRepository,
    CategoryRepository,
    TokenSecurity,
    AuthenticationGuard,
    AuthorizationGuard,
  ],
})
export class ProductModule {}
