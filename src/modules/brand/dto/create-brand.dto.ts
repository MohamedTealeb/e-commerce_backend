import { IsString, MaxLength, MinLength } from "class-validator"
import { IBrand } from "src/common/interfaces/brand.interface"

export class CreateBrandDto implements Partial<IBrand> {
    @MaxLength(26)
    @MinLength(2)
    @IsString()
    name:string
    @MaxLength(26)
    @MinLength(2)
    @IsString()
slogan:string

}
