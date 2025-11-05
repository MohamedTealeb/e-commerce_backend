import {  IsEmail, IsNotEmpty, IsString, IsStrongPassword, Length, MinLength, registerDecorator, Validate, ValidateIf, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { IsMatch } from "src/common/decoretors/match.custom.decoretor";
import { Body } from '@nestjs/common';

export class LoginBodyDto {
      @IsEmail()
    email: string;
    @IsStrongPassword()
    password: string;
}
export class SignupBodyDto  extends LoginBodyDto{
    @IsString()
    @IsNotEmpty()
    @Length(2,26,{message:'username must be between 2 and 26 characters'})
    username: string;
  
    // @Validate(MatchBetween)
    @ValidateIf((data:SignupBodyDto)=>{
    return Boolean(data.password)
    })
    @IsMatch(['password'],{message:'Passwords do not match'})
    confirmPassword: string;
}
export class SignupQueryDto {
    @MinLength(2)
    @IsString()
    flag: string;
}
export class ConfirmEmailDto {
 
    @IsEmail()
    email: string;
    @IsString()
    @IsNotEmpty()
    otp: string;
}
export class ForgetPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email: string;
  @IsString()
  @IsNotEmpty()
  otp: string;
  @IsStrongPassword()
  newPassword: string;
  @ValidateIf((data: ResetPasswordDto) => {
    return Boolean(data.newPassword)
  })
  @IsMatch(['newPassword'], { message: 'Passwords do not match' })
  confirmNewPassword: string;
}

export class GoogleSignupDto {
  @IsString()
  @IsNotEmpty()
  idToken: string;
}