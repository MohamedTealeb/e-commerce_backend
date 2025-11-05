import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { OrderRepository } from 'src/DB/repository/order.repository';
import { ProductRepository } from 'src/DB/repository/product.repository';
import { CartRepository } from 'src/DB/repository/cart.repository';
import { CartModel } from 'src/DB/model/cart.model';
import { ProductModel } from 'src/DB/model/product.model';
import { OrderModel } from 'src/DB/model/oreder.model';
import { CartService } from '../cart/cart.service';
import { CouponModel } from 'src/DB/model/coupon.model';
import { CouponRepository } from 'src/DB/repository/coupon.repository';
import { PaymentService } from 'src/common/utils/security/payment.service';

@Module({
  imports: [
    CartModel,
    ProductModel,
    OrderModel,
    UserModule,
    CouponModel,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600') },
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService,CartRepository,ProductRepository,OrderRepository,CartService,CouponRepository ,PaymentService],
})
export class OrderModule {}
