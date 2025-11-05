


import { BadRequestException } from "@nestjs/common";
import {createTransport, type Transporter} from "nodemailer"
import Mail from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport"

export const sendEmail=async(data:Mail.Options):Promise<void>=>{
    if(!data.html&&!data.attachments?.length&&!data.text){
        throw new BadRequestException("missing email content")
    }

const transporter:Transporter<SMTPTransport.SentMessageInfo,SMTPTransport.Options>=createTransport({
  service:"gmail",
    auth:{
        user:process.env.EMAIL || 'default@example.com',
        pass:process.env.EMAIL_PASSWORD || 'default-password'
    },
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000,   // 30 seconds
    socketTimeout: 60000,     // 60 seconds
});
 await transporter.sendMail({
    ...data,
    from:`"Mr Mohamedtealeb  "<${process.env.EMAIL || 'default@example.com'} >`

 })

}