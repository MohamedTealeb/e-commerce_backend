import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AuthenticationService } from "./auth.service";
import { ConfirmEmailDto, ForgetPasswordDto, GoogleSignupDto, LoginBodyDto, ResetPasswordDto, SignupBodyDto } from "./dto/signup.dto";
import { succesResponse } from "src/common/utils/response";
import { IResponse } from "src/common/interfaces/response.interfae";

@Controller("auth")
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  // @UsePipes(new ValidationPipe({ stopAtFirstError: true, whitelist: true, forbidNonWhitelisted: true }))
  @Post("signup")
  async signup(@Body() body: SignupBodyDto): Promise<IResponse<{ message: string }>> {
    console.log({ body });
    const result = await this.authenticationService.signup(body);
    return succesResponse({
      data: result,
      message: result.message,
      status: 201
    });
  }

  @HttpCode(200)
  @Post("login")
  async login(@Body() body: LoginBodyDto): Promise<IResponse<{ credentials: { accessToken: string; refreshToken: string } }>> {
    const data = await this.authenticationService.login(body);
    return succesResponse({
      data: { credentials: data.data.credentials },
      message: data.message,
      status: 200
    });
  }

  @Patch("confirm-email")
  async confirmEmail(@Body() body: ConfirmEmailDto): Promise<IResponse<{ message: string }>> {
    const result = await this.authenticationService.confirmEmail(body);
    return succesResponse({
      data: result,
      message: result.message,
      status: 200
    });
  }

  @Post("resend-otp")
  async resendOtp(@Body() body: { email: string }): Promise<IResponse<{ message: string }>> {
    const result = await this.authenticationService.resendOtp(body.email);
    return succesResponse({
      data: result,
      message: result.message,
      status: 200
    });
  }

  @Patch("forget-password")
  async forgetPassword(@Body() body: ForgetPasswordDto): Promise<IResponse<{ message: string }>> {
    const result = await this.authenticationService.forgetPassword(body);
    return succesResponse({
      data: result,
      message: result.message,
      status: 200
    });
  }

  @Patch("reset-password")
  async resetPassword(@Body() body: ResetPasswordDto): Promise<IResponse<{ message: string }>> {
    const result = await this.authenticationService.resetPassword(body);
    return succesResponse({
      data: result,
      message: result.message,
      status: 200
    });
  }

  @Post("signup-google")
  async signupGoogle(@Body() body: GoogleSignupDto): Promise<IResponse<{ accessToken: string; refreshToken: string; user: { id: number; username: string; email: string } }>> {
    const result = await this.authenticationService.signupGoogle(body);
    return succesResponse({
      data: result.data,
      message: result.message,
      status: 201
    });
  }

  @Post("login-google")
  async loginGoogle(@Body() body: GoogleSignupDto): Promise<IResponse<{ accessToken: string; refreshToken: string; user: { id: number; username: string; email: string } }>> {
    const result = await this.authenticationService.LoginWithGmail(body);
    return succesResponse({
      data: result.data,
      message: result.message,
      status: 200
    });
  }

}
