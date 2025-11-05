import { Controller, Get, Headers, ParseFilePipe, Patch, Req, SetMetadata, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserService } from './user.service';
import { IUser } from "src/common";
import  type{ Request } from "express";
import { AuthenticationGuard } from "src/common/guards/authentication/authentication.guard";
import { AuthorizationGuard } from "src/common/guards/authorization/authorization.guard";
import { RoleEnum } from "src/common/enums/user.enum";
import { Roles } from "src/common/decoretors/role.decorator";
import { Auth } from "src/common/decoretors/auth.decoretors";
import { tokenName } from "src/common/decoretors/tokenType.decorator";
import { TokenEnum } from "src/common/enums/token.enums";
import type { UserDocument } from "src/DB/model/user.model";
import { User } from "src/common/decoretors/credential.decorator";
import { PreferredLanguageInterceptor } from "src/common/interceptors/applyLanguage.interceptors";
import { delay, Observable, of } from "rxjs";
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import type { IAuthRequest } from "src/common/interfaces/token.interface";
import { localFileUpload } from "src/common/utils/multer/local.multer";
import type { IMulterFile } from "src/common/interfaces/multer.interface";
import { Validate } from 'class-validator';
import { FileValidation } from "src/common/utils/multer/validation.multer";
import { cloudFileUpload } from "src/common/utils/multer/cloud.multer";
import { StorageEnum } from "src/common/enums/multer.enums";
import { succesResponse } from "src/common/utils/response";
import { IResponse } from "src/common/interfaces/response.interfae";




@Controller('user')
export class UserController{
    constructor(private readonly userService:UserService){}
    
    
    // // @UseInterceptors(PreferredLanguageInterceptor)
    // @SetMetadata('tokenType',TokenEnum.ACCESS)
    // @UseGuards(AuthenticationGuard,AuthorizationGuard)
    @UseInterceptors(PreferredLanguageInterceptor)

    @Auth([RoleEnum.USER,  RoleEnum.ADMIN])
@Get('profile')
async profile( @Req() req:IAuthRequest,   @User() user:any ):Promise<IResponse<UserDocument | null>>{
    const profile=await this.userService.profile(user)
    return succesResponse<UserDocument | null>({data:profile})
}


@UseInterceptors(FileInterceptor('profileImage',cloudFileUpload({storageApproach:StorageEnum.disk,vaildation:FileValidation.image})))
@Auth([RoleEnum.USER])
@Patch('profileImage')
async profileImage(
    @User() user:UserDocument,
    @UploadedFile(ParseFilePipe) file:Express.Multer.File,

){

    const url=await this.userService.profileImage(file,user)
    return succesResponse<{proflie:IUser}>({data:{proflie:user}})
}


@UseInterceptors(FilesInterceptor('coverImage',2,localFileUpload({folder:'users',vaildation:FileValidation.image,fileSize:2})))
@Auth([RoleEnum.USER])
@Patch('cover-image')
coverImage(
    @UploadedFiles(new ParseFilePipe ({
        fileIsRequired:true,
    })) files:Array<IMulterFile>,
){
    return {message:'done',files}
}

@UseInterceptors(FileFieldsInterceptor([{name:'profileImage',maxCount:1},{name:'coverImage',maxCount:2},],cloudFileUpload({
    storageApproach:StorageEnum.disk,
    vaildation:FileValidation.image,
    fileSize:2
})))
@Auth([RoleEnum.USER])
@Patch('image')
Image(
    @UploadedFiles(new ParseFilePipe ({
        fileIsRequired:true,
    })) files:{profileImage:IMulterFile,coverImage:Array<IMulterFile>},
){
    return {message:'done',files:{profileImage:files.profileImage,coverImage:files.coverImage}}
}
}