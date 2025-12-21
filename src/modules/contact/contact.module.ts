import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { ContactRepository } from 'src/DB/repository/contact.repository';
import { ContactModel } from 'src/DB/model/contact.model';

@Module({
  imports: [ContactModel],
  controllers: [ContactController],
  providers: [ContactService, ContactRepository],
})
export class ContactModule {}
