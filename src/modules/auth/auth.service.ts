import { BadGatewayException, BadRequestException, ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { IUser } from "src/common";
import { ConfirmEmailDto, ForgetPasswordDto, GoogleSignupDto, LoginBodyDto, ResetPasswordDto, SignupBodyDto } from "./dto/signup.dto";
import { UserRepository } from '../../DB/repository/user.repository';
import { compareHash, generateHash } from "src/common/utils/security/hash.security";
import { TokenSecurity } from 'src/common/utils/security/token.security';
import { generateNumberOtp } from 'src/common/utils/email/otp';
import { sendEmail } from 'src/common/utils/email/send.email';
import { verifyEmail } from 'src/common/utils/email/verify.template';
import { resetPasswordEmail } from 'src/common/utils/email/reset-password.template';
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { ProviderEnum, RoleEnum } from "src/common/enums/user.enum";
import { OtpRepository } from "src/DB/repository/otp.repository";
import { otpEnum } from "src/common/enums/otp.enum";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "src/common/decoretors/credential.decorator";
import { Model } from "mongoose";
import { UserDocument } from "src/DB/model/user.model";
import { sign } from "jsonwebtoken";
import { JwtService } from "@nestjs/jwt";



@Injectable()
export class AuthenticationService {
  private users: IUser[] = [];
  
  constructor(
    
    private readonly userRepository: UserRepository,
    private readonly tokenSecurity: TokenSecurity,
    private readonly otpRepository: OtpRepository,
    private readonly jwtService: JwtService
  ) {}
  private async verifyGmailAccount(idToken:string):Promise<TokenPayload>{
    const client=new OAuth2Client();
    const ticket=await client.verifyIdToken({
        idToken,
        audience:process.env.WEB_CLIENT_IDS?.split(",")||[]
    })
    const payload=ticket.getPayload()
    if(!payload?.email_verified){
        throw new BadRequestException("fail to verify google acc")
    }
    return payload
}


async signup(data:SignupBodyDto):Promise<{message: string}>{
 const {email ,password ,firstName, lastName} =data
 const checkUserExist=await this.userRepository.findOne({filter:{email}})
 if(checkUserExist){
    throw new ConflictException('user already exists')
 }
 
 const otp = generateNumberOtp();
 
 const encryptedOtp = await generateHash(otp.toString());
 
 const user=await this.userRepository.create({
    data:{
      firstName,
      lastName,
      email,
      password
    },
 })

 
 if(!user){
    throw new BadGatewayException("fail to signup this acc ")
 }
 
 const otpRecord=await this.otpRepository.create({
  data:{
      code:otp,
      expiredAt:new Date(Date.now()+15*60*1000),
      createdBy:user._id,
      type:otpEnum.ConfirmEmail
  }
 })

 

 
 return {
   message: "Account created successfully. Please check your email for verification code."
 }
}

async login(data: LoginBodyDto) {
  if (!data) {
    throw new BadRequestException('Request body is missing');
  }

  const { email, password } = data;

  if (!email || !password) {
    throw new BadRequestException('Email and password are required');
  }

  const user = await this.userRepository.findOne({ filter: { email } });

  if (!user || !(await compareHash(password, user.password))) {
    throw new UnauthorizedException('Invalid email or password');
  }

  if (!user.confirmEmail) {
    throw new ConflictException('Please confirm your email before logging in');
  }

  const payload = { sub: user._id.toString() };
  const credentials = {
    accessToken: await this.tokenSecurity.generateToken({ payload }),
    refreshToken: await this.tokenSecurity.generateToken({
      payload,
      options: {
        secret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
        expiresIn: Number(process.env.JWT_REFRESH_EXPIRES_IN) || 86400
      }
    })
  };

  const { password: _, ...safeUser } = user;

  return {
    message: 'Login successful',
    data: { credentials },
    user: { role: user.role }
  };
}


  


  async confirmEmail(data: ConfirmEmailDto): Promise<{ message: string }> {
    const { email, otp } = data;
    const user = await this.userRepository.findOne({ filter: { email } });
    
    if (!user) {
      throw new ConflictException('User not found');
    }
    
    // Find the OTP record for this user and type
    const otpRecord = await this.otpRepository.findOne({
      filter: {
        createdBy: user._id,
        type: otpEnum.ConfirmEmail
      }
    });
    
    if (!otpRecord) {
      throw new ConflictException('No OTP found for this email');
    }
    
    // Check if OTP has expired
    if (new Date() > otpRecord.expiredAt) {
      throw new ConflictException('OTP code has expired');
    }
    
    const isValidOtp = await compareHash(otp, otpRecord.code);
    if (!isValidOtp) {
      throw new ConflictException('Invalid OTP code');
    }
    
    // Update user email confirmation
    await this.userRepository.updateOne({ 
      filter: { email }, 
      update: { 
        confirmEmail: new Date()
      } 
    });
    
    // Delete the used OTP
    await this.otpRepository.deleteMany({
      createdBy: user._id,
      type: otpEnum.ConfirmEmail
    });
    
    return { message: "Email confirmed successfully" };
  }

  async resendOtp(email: string): Promise<{ message: string }> {
         
    const user = await this.userRepository.findOne({ filter: { email },
    options:{
      populate:[{path:"otp",match:{type:otpEnum.ConfirmEmail}}]
    }
    });
    
    if (!user) {
      throw new ConflictException('User not found');
    }
    
    if (user.confirmEmail) {
      throw new ConflictException('Email already confirmed');
    }
    
    // Delete existing OTP for this user and type
    await this.otpRepository.deleteMany({
      createdBy: user._id,
      type: otpEnum.ConfirmEmail
    });
    
    const otp = generateNumberOtp();
    
    // Create new OTP using the repository
    // Email will be sent automatically by the OTP model's post-save hook
    await this.otpRepository.create({
      data: {
        code: otp.toString(),
        expiredAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
        createdBy: user._id,
        type: otpEnum.ConfirmEmail
      }
    });
    
    return { message: "New verification code sent to your email" };
  }
  async forgetPassword(data: ForgetPasswordDto): Promise<{ message: string }> {
    const { email } = data;
    const user = await this.userRepository.findOne({ filter: { email } });
    
    if (!user) {
      throw new ConflictException('User not found');
    }

    if (!user.confirmEmail) {
      throw new ConflictException('Please confirm your email first');
    }

    try {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      const recentOtp = await this.otpRepository.findOne({
        filter: {
          createdBy: user._id,
          type: otpEnum.ResetPassword,
          createdAt: { $gte: twoMinutesAgo }
        }
      });

      if (recentOtp) {
        throw new ConflictException('Please wait 2 minutes before requesting another password reset code');
      }

      await this.otpRepository.deleteMany({
        createdBy: user._id,
        type: otpEnum.ResetPassword
      });

      const otp = generateNumberOtp();

    
      await this.otpRepository.create({
        data: {
          code: otp.toString(),
          expiredAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
          createdBy: user._id,
          type: otpEnum.ResetPassword
        }
      });

      return { message: "Password reset code sent to your email" };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('Error in forgetPassword:', error);
      throw new ConflictException('Failed to process password reset request');
    }
  }

  async resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
    const { email, otp, newPassword } = data;
    const user = await this.userRepository.findOne({ filter: { email } });
    
    if (!user) {
      throw new ConflictException('User not found');
    }
    
    // Find the OTP record for this user and type
    const otpRecord = await this.otpRepository.findOne({
      filter: {
        createdBy: user._id,
        type: otpEnum.ResetPassword
      }
    });
    
    if (!otpRecord) {
      throw new ConflictException('No password reset request found for this email');
    }
    
    // Check if OTP has expired
    if (new Date() > otpRecord.expiredAt) {
      throw new ConflictException('OTP code has expired');
    }
    
    const isValidOtp = await compareHash(otp, otpRecord.code);
    if (!isValidOtp) {
      throw new ConflictException('Invalid OTP code');
    }
    
    const isSamePassword = await compareHash(newPassword, user.password);
    if (isSamePassword) {
      throw new ConflictException('New password must be different from current password');
    }
    
    // Update password and clear OTP
    await this.userRepository.updateOne({ 
      filter: { email }, 
      update: { 
        password: newPassword,
        changeCredentials: new Date()
      } 
    });
    
    // Delete the used OTP
    await this.otpRepository.deleteMany({
      createdBy: user._id,
      type: otpEnum.ResetPassword
    });
    
    return { message: "Password reset successfully" };
  }
  async signupGoogle(data: GoogleSignupDto): Promise<{ 
    message: string; 
    data: { 
      accessToken: string;
      refreshToken: string;
      user: {
        id: number;
        username: string;
        email: string;
      }
    } 
  }> {
    const { idToken } = data;
    const { email, family_name, given_name, picture }: TokenPayload = await this.verifyGmailAccount(idToken);
    
    const user = await this.userRepository.findOne({ filter: { email } });
    if (user) {
      if (user.provider === ProviderEnum.GOOGLE) {
        return await this.LoginWithGmail(data);
      }
      throw new ConflictException(`Email exists with another provider: ${user.provider}`);
    }
    
    const newUser = await this.userRepository.create({
      data: {
        email,
        provider: ProviderEnum.GOOGLE,
        firstName: given_name,
        lastName: family_name,
        confirmEmail: new Date(), 
        changeCredentials: new Date()
      }
    });
    
    if (!newUser) {
      throw new BadGatewayException('Failed to create Google account');
    }
    
    return await this.LoginWithGmail(data);
  }

  async LoginWithGmail(data: GoogleSignupDto): Promise<{ 
    message: string; 
    data: { 
      accessToken: string;
      refreshToken: string;
      user: {
        id: number;
        username: string;
        email: string;
      }
    } 
  }> {
    const { idToken } = data;
    const { email }: TokenPayload = await this.verifyGmailAccount(idToken);
    
    const user = await this.userRepository.findOne({ filter: { email } });
    if (!user) {
      throw new ConflictException('User not found');
    }
    
    if (user.provider !== ProviderEnum.GOOGLE) {
      throw new ConflictException('User is not a Google account');
    }
    
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const username = `${firstName} ${lastName}`.trim() || '';
    
    const accessToken = await this.tokenSecurity.generateToken({
      payload: {
        sub: user._id.toString(),
        user: {
          id: user.id,
          email: user.email,
          username: username,
          role: user.role
        }
      }
    });
    
    const refreshToken = await this.tokenSecurity.generateToken({
      payload: {
        sub: user._id.toString(),
        user: {
          id: user.id,
          email: user.email,
          username: username,
          role: user.role
        }
      },
      options: {
        secret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
        expiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '86400')
      }
    });
    
    return {
      message: 'Google login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      }
    };
  }

  async refreshToken(refreshToken: string): Promise<{ 
    message: string; 
    data: { 
      accessToken: string;
      refreshToken: string;
      user: {
        id: number;
        username: string;
        email: string;
        role: string;
      }
    } 
  }> {
    // Verify the refresh token
    const decoded = await this.tokenSecurity.verifyToken({
      token: refreshToken,
      secret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret'
    });
    
    if (!decoded) {
      throw new ConflictException('Invalid refresh token');
    }
    
    // Find the user
    const user = await this.userRepository.findOne({ 
      filter: { email: (decoded as any).user?.email || (decoded as any).sub } 
    });
    
    if (!user) {
      throw new ConflictException('User not found');
    }
    
    // Generate new tokens
    const newAccessToken = await this.tokenSecurity.generateToken({
      payload: {
        sub: user._id.toString(),
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role
        }
      }
    });
    
    const newRefreshToken = await this.tokenSecurity.generateToken({
      payload: {
        sub: user._id.toString(),
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role
        }
      },
      options: {
        secret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
        expiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '86400')
      }
    });
    
    return {
      message: "Tokens refreshed successfully",
      data: { 
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          email: user.email
        }
      }
    };
  }
}
