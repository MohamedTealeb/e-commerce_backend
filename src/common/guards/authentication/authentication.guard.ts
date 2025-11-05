import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TokenEnum } from 'src/common/enums/token.enums';
import { TokenSecurity } from 'src/common/utils/security/token.security';
import { Token } from 'src/DB/model/token.model';
import tr from 'zod/v4/locales/tr.js';
import { Reflector } from '@nestjs/core';
import { UserRepository } from 'src/DB/repository/user.repository';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly tokenSecurity: TokenSecurity,
    private readonly reflector: Reflector,
    private readonly userRepository: UserRepository
  ) {}
 async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const tokenType:TokenEnum=this.reflector.getAllAndOverride<TokenEnum>("tokenType",[
      context.getHandler(),
      context.getClass(),
    ]) ?? TokenEnum.ACCESS;
     let req:any;
    let authorization:string=''
  switch(context.getType()){
    case 'http':
      const request=context.switchToHttp()
       req=request.getRequest();
      authorization=req.headers['authorization'] ?? ''
      break;


      // case 'rpc':
      //   const request_rpc=context.switchToRpc().getContext();
      //   break;

      //   case 'ws':
      //     const request_ws=context.switchToWs().getClient();
      //     break;

    default:
    break;
  }
   // Extract token from authorization header
   const token = authorization?.replace('Bearer ', '') || '';
    
   if (!token) {
     return false;
   }
   
   // Verify the token (check validity and expiration)
   const isRefresh = tokenType === TokenEnum.REFRESH;
   const secret = isRefresh ? (process.env.JWT_REFRESH_SECRET || 'default-refresh-secret') : (process.env.JWT_SECRET || 'default-secret');
   const decoded = await this.tokenSecurity.verifyToken({
     token,
     secret
   });
   
   if (!decoded) {
     return false;
   }
   
   // Extract user ID from the decoded token
   const userId = (decoded as any)?.sub;
   if (!userId) {
     return false;
   }
   
   // Fetch the user from the database
   const user = await this.userRepository.findOne({ filter: { _id: userId } });
   if (!user) {
     return false;
   }
   
   // Set credentials on request
   req.credentials = {
     user: user,
     decode: decoded
   }
   
   // Also set decode directly for backward compatibility
   req.decode = decoded;
    return true;
  }
}
