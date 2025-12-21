import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ContactRepository } from 'src/DB/repository/contact.repository';
import { Types } from 'mongoose';

@Injectable()
export class ContactService {
  constructor(private readonly contactRepository: ContactRepository) {}

  async create(createContactDto: CreateContactDto) {
    const contact = await this.contactRepository.create({ data: createContactDto });
    return contact;
  }

  async findAll() {
    const contacts = await this.contactRepository.find({ filter: {}, options: { sort: { createdAt: -1 } } });
    return contacts;
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Contact not found');
    }
    const contact = await this.contactRepository.findOne({
      filter: { _id: new Types.ObjectId(id) },
    });
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    return contact;
  }

  async update(id: string, updateContactDto: UpdateContactDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Contact not found');
    }
    const contact = await this.contactRepository.findByIdAndUpdate({
      id: new Types.ObjectId(id),
      update: updateContactDto,
    });
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    return contact;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Contact not found');
    }
    const contact = await this.contactRepository.findOneAndDelete({
      filter: { _id: new Types.ObjectId(id) },
    });
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    return { message: 'Contact deleted successfully' };
  }
}
