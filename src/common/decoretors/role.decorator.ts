
import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from '../enums/user.enum';
import { tokenName } from './tokenType.decorator';


export const roleName='roles';
export const Roles=(accessRoles:RoleEnum[])=>{
    return SetMetadata(roleName,accessRoles)
}