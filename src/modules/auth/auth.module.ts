import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { AuthenticationService } from "./auth.service";
import { AuthenticationController } from "./auth.controller";

import { UserModel } from "src/DB/model/user.model";
import { TokenModel } from "src/DB/model/token.model";
import { OtpModel } from "src/DB/model/otp.model";

import { UserRepository } from "src/DB/repository/user.repository";
import { OtpRepository } from "src/DB/repository/otp.repository";

import { TokenSecurity } from "src/common/utils/security/token.security";

@Module({
  imports: [
    ConfigModule, 
    UserModel,
    TokenModel,
    OtpModel,

    // ✅ الطريقة الصحيحة لربط JWT مع ConfigService
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'default-secret',
        signOptions: {
          expiresIn: parseInt(config.get<string>('JWT_EXPIRES_IN') || '3600'),
        },
      }),
    }),
  ],
  controllers: [AuthenticationController], // ✅ احذف TokenSecurityController إن ما كان موجود
  providers: [
    AuthenticationService,
    UserRepository,
    OtpRepository,
    TokenSecurity,
  ],
  exports: [AuthenticationService],
})
export class AuthModule {}
