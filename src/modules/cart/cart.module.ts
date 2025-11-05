import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ProductRepository } from 'src/DB/repository/product.repository';
import { CartRepository } from 'src/DB/repository/cart.repository';
import { CartModel } from 'src/DB/model/cart.model';
import { ProductModel } from 'src/DB/model/product.model';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { UserRepository } from 'src/DB/repository/user.repository';

@Module({
  imports: [ProductModel,CartModel,
    UserModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600') },
    }),
  ],
  controllers: [CartController],
  providers: [CartService,CartRepository,ProductRepository ,UserRepository],
})
export class CartModule {}
