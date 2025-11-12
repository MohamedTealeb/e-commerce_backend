import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { resolve } from 'path';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { MongooseModule } from '@nestjs/mongoose';
import { BrandModule } from './modules/brand/brand.module';
import { CategoryModule } from './modules/category/category.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { StaticsModule } from './modules/statics/statics.module';
import { PaymentService } from './common/utils/security/payment.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
  ConfigModule.forRoot({
      envFilePath: resolve("./config/.env"),
      isGlobal: true,
      
    }),
    CacheModule.register({
      isGlobal:true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/application' ,{serverSelectionTimeoutMS:5000}),
    AuthModule,
    UserModule,
    BrandModule,
    ProductModule,
    CategoryModule,
    CartModule,
    OrderModule,
    CouponModule,
    StaticsModule,

    
    
    
  ],
  controllers: [AppController ],
  providers: [AppService ,PaymentService ,],
  
  
  
  
})

export class AppModule {}
