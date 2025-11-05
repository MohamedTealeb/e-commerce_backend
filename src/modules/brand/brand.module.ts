import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { BrandRepository } from 'src/DB/repository/brand.repository';
import { BrandModel } from 'src/DB/model/brand.model';
import { UserModule } from 'src/modules/user/user.module';
import { TokenSecurity } from 'src/common/utils/security/token.security';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { AuthorizationGuard } from 'src/common/guards/authorization/authorization.guard';

@Module({
  imports: [
    BrandModel,
    UserModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600') },
    }),
  ],
  controllers: [BrandController],
  providers: [
    BrandService,
    BrandRepository,
    TokenSecurity,
    AuthenticationGuard,
    AuthorizationGuard,
  ],
  exports:[BrandRepository],

})
export class BrandModule {}
