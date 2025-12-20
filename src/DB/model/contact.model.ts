import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({
    timestamps: true,
    strictQuery: true,
    strict: true,
})
export class Contact {
    @Prop({ type: String, required: true, minLength: 2, maxLength: 100, trim: true })
    name: string;

    @Prop({ type: String, required: true, minLength: 10, maxLength: 20, trim: true })
    phone: string;

    @Prop({ type: String, required: false, maxLength: 200, trim: true })
    email?: string;

    @Prop({ type: String, required: false, maxLength: 200, trim: true })
    subject?: string;

    @Prop({ type: String, required: true, minLength: 5, maxLength: 5000, trim: true })
    message: string;

    @Prop({ type: Boolean, default: false })
    isRead?: boolean;
}

export type ContactDocument = HydratedDocument<Contact>;
const contactSchema = SchemaFactory.createForClass(Contact);

export const ContactModel = MongooseModule.forFeature([{ name: Contact.name, schema: contactSchema }]);