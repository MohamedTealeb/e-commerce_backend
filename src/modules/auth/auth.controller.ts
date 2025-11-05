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
import { IUser } from "src/common";

@Controller("auth")
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  // @UsePipes(new ValidationPipe({ stopAtFirstError: true, whitelist: true, forbidNonWhitelisted: true }))
  @Post("signup")
  async signup(@Body() body: SignupBodyDto): Promise<{ message: string }> {
    console.log({ body });
    return await this.authenticationService.signup(body);
  }

  @HttpCode(200)
  @Post("login")
  async login(@Body() body: LoginBodyDto): Promise<{ message: string; data: { credentials: { accessToken: string; refreshToken: string }; user:IUser } }> {
    const data = await this.authenticationService.login(body);
    return {
      message: data.message,
      data: {
        credentials: data.data.credentials,
        user: data.data.user as IUser
      }
    }
  }

  @Patch("confirm-email")
  async confirmEmail(@Body() body: ConfirmEmailDto):Promise<{ message: string }> {
    return await this.authenticationService.confirmEmail(body);
  }

  @Post("resend-otp")
  async resendOtp(@Body() body: { email: string }) {
    return await this.authenticationService.resendOtp(body.email);
  }

  @Patch("forget-password")
  async forgetPassword(@Body() body: ForgetPasswordDto) {
    return await this.authenticationService.forgetPassword(body);
  }

  @Patch("reset-password")
  async resetPassword(@Body() body: ResetPasswordDto) {
    return await this.authenticationService.resetPassword(body);
  }
  @Post("signup-google")
  async signupGoogle(@Body() body: GoogleSignupDto) {
    return await this.authenticationService.signupGoogle(body);
  }

  @Post("login-google")
  async loginGoogle(@Body() body: GoogleSignupDto) {
    return await this.authenticationService.LoginWithGmail(body);
  }

}
