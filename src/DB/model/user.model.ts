import { MongooseModule, Prop, Schema, SchemaFactory, Virtual } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { GenderEnum, LanguageEnum, ProviderEnum, RoleEnum } from "src/common/enums/user.enum";
import { generateHash } from "src/common/utils/security/hash.security";
import { OtpDocument } from "./otp.model";
import { IUser } from "src/common";
import { IProduct } from "src/common/interfaces/product.interface";


@Schema({
    strictQuery:true,
    timestamps:true,
    toObject:{virtuals:true},
    toJSON:{virtuals:true}
})
export class User implements IUser {
    _id?: Types.ObjectId;
    
    @Prop({type:String,minlength:2,maxlength:26,trim:true})
    firstName: string;
    @Prop({type:String,minlength:2,maxlength:26,trim:true})
    lastName: string;
    @Virtual({
        get:function(this:User){
            const firstName = this.firstName || '';
            const lastName = this.lastName || '';
            if (!firstName && !lastName) {
                return '';
            }
            return `${firstName} ${lastName}`.trim()
        },
        set:function(value:string){
            if (!value || typeof value !== 'string') {
                this.set({firstName: '', lastName: ''});
                return;
            }
            const parts = value.trim().split(/\s+/);
            const firstName = parts[0] || '';
            const lastName = parts.slice(1).join(' ') || '';
            this.set({firstName, lastName});
        }
    })
    username:string

   @Prop({type:String,enum:RoleEnum,default:RoleEnum.USER})
     role:RoleEnum

    @Prop({
        type:String,
        required:true,
        unique:true,
    })
    email:string


    @Prop({type:String,required:function(this:User){
        return this.provider===ProviderEnum.GOOGLE ? false : true
    }})
    password:string;

    @Prop({type:String,required:false})
    confirmPassword:string;

    @Prop({type:String,enum:ProviderEnum,default:ProviderEnum.SYSTEM})
   provider:ProviderEnum; 

    @Prop({type:String,enum:GenderEnum,default:GenderEnum.male})
   gender:GenderEnum;
  @Prop({type:Date ,required:false})
   confirmedAt?:Date

  @Prop({type:Date,required:false})
   confirmEmail?:Date

  @Prop({type:Date,required:false})
   changeCredentials?:Date

   @Prop({type:Date,required:false})
   createdAt:Date;

   @Prop({type:Date,required:false})
   updatedAt:Date;


   @Prop({type:String,enum:LanguageEnum,default:LanguageEnum.EN})
   preferredLanguage:LanguageEnum

   @Virtual()
   otp:OtpDocument[]

   @Prop({type:String,required:false})
   profilePicture?:string;


@Prop({type:[{type:Types.ObjectId,ref:"Product"}]})
   wishlist?: Types.ObjectId[] 

}
const userSchema=SchemaFactory.createForClass(User)
userSchema.virtual("otp",{
    ref:"Otp",
    localField:"_id",
    foreignField:"createdBy",
})
userSchema.pre('save',async function(next){
if(this.isModified('password')) {
    this.password=await generateHash(this.password)
}
next()

})

export type UserDocument=HydratedDocument<User>
export const UserModel=MongooseModule.forFeature([{name:User.name,schema:userSchema}])

export const connectedSocket=new Map<string,string[]>()