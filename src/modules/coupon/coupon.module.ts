import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { CouponModel } from 'src/DB/model/coupon.model';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { CouponRepository } from 'src/DB/repository/coupon.repository';

@Module({
  imports: [
    CouponModel,
    UserModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600') },
    }),
  ],
  controllers: [CouponController],
  providers: [CouponService ,CouponRepository],
})
export class CouponModule {}
