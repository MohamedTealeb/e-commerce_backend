import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { roleName } from 'src/common/decoretors/role.decorator';
import { RoleEnum } from 'src/common/enums/user.enum';
import { getSocketAuth } from 'src/common/utils/socket';

@Injectable()
export class AuthorizationGuard implements CanActivate {

  constructor(private readonly reflector: Reflector) {}
  canActivate( 
    context: ExecutionContext,
  ): boolean {
    const accessRoles: RoleEnum[] = this.reflector.getAllAndOverride<RoleEnum[]>(roleName, [
      context.getHandler(),
      context.getClass(),
    ]) ?? [];

    if (accessRoles.length === 0) {
      return true;
    }

    let authorization:string='';
    let role: RoleEnum | undefined;
    switch(context.getType()){
      case 'http':
        const req = context.switchToHttp().getRequest();
        role = (req.credentials?.user?.role as RoleEnum | undefined);
        authorization=req.headers.authorization;
      
        break;
        case 'ws':
          const wa_client=context.switchToWs();
          const ws_client=wa_client.getClient();
          authorization=getSocketAuth(ws_client);

          default:
          break;

    } 

    if (!role || !authorization) {
      return false;
    }

    return accessRoles.includes(role)
  }
}
