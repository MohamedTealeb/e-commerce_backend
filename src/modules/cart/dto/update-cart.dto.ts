import { PartialType } from '@nestjs/mapped-types';
import { CreateCartDto } from './create-cart.dto';
import { Types } from 'mongoose';
import { MongoDBIds } from 'src/common/decoretors/match.custom.decoretor';
import { Validate } from 'class-validator';


export class RemoveItemCartDto  {



    @Validate(MongoDBIds)
    productId:Types.ObjectId[]
}
export class UpdateCartDto extends PartialType(CreateCartDto) {}