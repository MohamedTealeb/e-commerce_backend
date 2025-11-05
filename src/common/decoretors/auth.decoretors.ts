import { applyDecorators, UseGuards } from "@nestjs/common";
import { TokenEnum } from "../enums/token.enums";
import { RoleEnum } from "../enums/user.enum";
import { AuthenticationGuard } from "../guards/authentication/authentication.guard";
import { AuthorizationGuard } from "../guards/authorization/authorization.guard";
import { Token } from "./tokenType.decorator";
import { Roles } from "./role.decorator";



export function Auth(roles:RoleEnum[],type:TokenEnum=TokenEnum.ACCESS){
    return applyDecorators(
        Token(type),
        Roles(roles),
        UseGuards(AuthenticationGuard,AuthorizationGuard)
    )
}