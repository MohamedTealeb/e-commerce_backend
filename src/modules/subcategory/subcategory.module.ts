import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SubcategoryService } from './subcategory.service';
import { SubcategoryController } from './subcategory.controller';
import { CategoryRepository } from 'src/DB/repository/category.repository';
import { CategoryModel } from 'src/DB/model/category.model';
import { TokenSecurity } from 'src/common/utils/security/token.security';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { AuthorizationGuard } from 'src/common/guards/authorization/authorization.guard';
import { UserModule } from 'src/modules/user/user.module';

@Module({
  imports: [
    CategoryModel,
    UserModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600') },
    }),
  ],
  controllers: [SubcategoryController],
  providers: [
    SubcategoryService,
    CategoryRepository,
    TokenSecurity,
    AuthenticationGuard,
    AuthorizationGuard,
  ],
})
export class SubcategoryModule {}