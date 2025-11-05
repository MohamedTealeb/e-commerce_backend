import { Injectable } from "@nestjs/common";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { JwtPayload } from "jsonwebtoken";

@Injectable()
export class TokenSecurity {
  constructor(private readonly jwtService: JwtService) {}

 generateToken=async({
  payload,
  options={
    secret:process.env.JWT_SECRET || 'default-secret',
    expiresIn:Number(process.env.JWT_EXPIRES_IN) || 3600,
  }
 }: {
    payload:object,
    options?:JwtSignOptions
 }):Promise<string>=>{
  return await this.jwtService.signAsync(payload, options);
 }


  verifyToken=async({token, secret=process.env.JWT_SECRET || 'default-secret'}:{
    token:string,
    secret?:string
  }): Promise<JwtPayload | null> => {
    try {
      return this.jwtService.verify(token, { secret: secret || process.env.JWT_SECRET || 'default-secret' });
    } catch (e) {
      return null;
    }
  }

  decodeToken=async({token}:{token:string}): Promise<JwtPayload | null> => {
    return this.jwtService.decode(token);
  }
}
