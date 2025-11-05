import { SetMetadata } from "@nestjs/common";
import { TokenEnum } from "../enums/token.enums";



export const tokenName='tokenType';
export const Token=(type:TokenEnum=TokenEnum.ACCESS)=>{

return SetMetadata(tokenName,type)

}