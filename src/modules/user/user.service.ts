import {  Injectable } from "@nestjs/common";
import { IUser } from "src/common";
import { RoleEnum } from "src/common/enums/user.enum";
import { S3Service } from "src/common/utils/security/s3.services";
import type { UserDocument } from "src/DB/model/user.model";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UserRepository } from "src/DB/repository/user.repository";
import { Auth } from "src/common/decoretors/auth.decoretors";
import { User } from "src/common/decoretors/credential.decorator";


@Injectable()
export class UserService {
    constructor(
        private readonly s3Service:S3Service,
        private readonly userRepository:UserRepository
    ){}


async profile(user:UserDocument){
    const userDocument=await this.userRepository.findOne({filter:{_id:user._id},options:{populate:{path:"wishlist",select:{_id:1,name:1,price:1,image:1,slug:1,category:1,brand:1,originalPrice:1,discountPercent:1,salePrice:1}}},select:{password:0,resetPasswordOtp:0,confirmEmailOtp:0}})
    return userDocument
}
async    profileImage(file:Express.Multer.File,user:any):Promise<string>{
        const userId = user.sub || user.id || user._id || user.userId;
        
        const userDocument = await this.userRepository.findOne({filter:{_id:userId}});
        if (!userDocument) {
            throw new Error('User not found');
        }
        
        userDocument.profilePicture=await this.s3Service.uploadFile({
            file,
            path:`users/${userDocument._id.toString()}`
        })
        await userDocument.save()
        return userDocument.profilePicture


    }
}