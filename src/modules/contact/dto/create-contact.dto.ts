import { IsString, IsNotEmpty, IsOptional, IsEmail, MinLength, MaxLength } from 'class-validator';

export class CreateContactDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    name: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(20)
    phone: string;

    @IsEmail()
    @IsOptional()
    @MaxLength(200)
    email?: string;

    @IsString()
    @IsOptional()
    @MaxLength(200)
    subject?: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    @MaxLength(5000)
    message: string;
}
