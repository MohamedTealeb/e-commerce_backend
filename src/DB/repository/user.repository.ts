import { Injectable } from '@nestjs/common';
import { UserDocument as TDocument, User } from 'src/DB/model/user.model';
import { DataBaseRepository } from './database.repository';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserRepository extends DataBaseRepository<User>{
    constructor(@InjectModel(User.name) protected override readonly model:Model<TDocument>){
        super(model)
    }
}