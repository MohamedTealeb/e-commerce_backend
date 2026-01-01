import { Injectable } from "@nestjs/common";
import { DataBaseRepository } from "./database.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Contact, ContactDocument } from "../model/contact.model";

@Injectable()
export class ContactRepository extends DataBaseRepository<Contact> {
    constructor(@InjectModel(Contact.name) protected readonly model: Model<ContactDocument>) {
        super(model);
    }
}


