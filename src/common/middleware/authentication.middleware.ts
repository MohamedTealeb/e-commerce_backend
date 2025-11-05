import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TokenSecurity } from '../utils/security/token.security';
import { TokenEnum } from '../enums/token.enums';


export const PreAuth=(tokenType:TokenEnum=TokenEnum.ACCESS)=>{
    return async (req: any, res: Response, next: NextFunction) => {
       
           req.tokenType=tokenType;
           next();
    }
}


@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(private readonly tokenSecurity: TokenSecurity) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new BadRequestException('Authorization header is missing or invalid');
      }

      const token = authHeader.split(' ')[1];

      const decoded = await this.tokenSecurity.decodeToken({ token });
      if (!decoded) {
        throw new BadRequestException('Token is invalid');
      }

      console.log('Decoded token:', JSON.stringify(decoded, null, 2));

      (req as any).credentials = {
        user: (decoded as any)?.user || decoded,
        decode: decoded,
      };
      
      (req as any).decode = decoded;

      next();
    } catch (error) {
      throw new BadRequestException('Unauthorized request');
    }
  }
}
