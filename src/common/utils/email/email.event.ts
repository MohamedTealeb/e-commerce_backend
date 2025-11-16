import { EventEmitter } from "node:events";
import Mail from "nodemailer/lib/mailer";
import { sendEmail } from "../email/send.email";
import { verifyEmail, getLogoPath } from "../email/verify.template";
import { resetPasswordEmail } from "../email/reset-password.template";
import { otpEnum } from "../../enums/otp.enum";


interface IEmail extends Mail.Options{
    otp:string;
    subject:string;
    html:string;
    attachments?: Mail.Attachment[];
}
export const emailEvent=new EventEmitter();

emailEvent.on(otpEnum.ConfirmEmail,async(data:IEmail)=>{
    try{
        data.subject=otpEnum.ConfirmEmail;
        const logoPath = getLogoPath();
        
        // Add logo as attachment if found
        if (logoPath) {
            data.attachments = data.attachments || [];
            data.attachments.push({
                filename: 'logo.png',
                path: logoPath,
                cid: 'logo'
            });
            data.html = verifyEmail({otp:data.otp,title:"Email Confirmation", useCid: true});
        } else {
            data.html = verifyEmail({otp:data.otp,title:"Email Confirmation"});
        }
        
        await  sendEmail(data)

    }
    catch(error){
        console.log(`fail to send email`,error);
        
    }
})
emailEvent.on(otpEnum.ResetPassword,async(data:IEmail)=>{
    try{
        data.subject="Password Reset - OTP Code";
        const logoPath = getLogoPath();
        
        // Add logo as attachment if found
        if (logoPath) {
            data.attachments = data.attachments || [];
            data.attachments.push({
                filename: 'logo.png',
                path: logoPath,
                cid: 'logo'
            });
            data.html = resetPasswordEmail({otp:data.otp,title:"Password Reset Request", useCid: true});
        } else {
            data.html = resetPasswordEmail({otp:data.otp,title:"Password Reset Request"});
        }
        
        await  sendEmail(data)

    }
    catch(error){
        console.log(`fail to send email`,error);
        
    }
})
emailEvent.on(otpEnum.ForgetPassword,async(data:IEmail)=>{

    try{
        data.subject=otpEnum.ForgetPassword;
        const logoPath = getLogoPath();
        
        // Add logo as attachment if found
        if (logoPath) {
            data.attachments = data.attachments || [];
            data.attachments.push({
                filename: 'logo.png',
                path: logoPath,
                cid: 'logo'
            });
            data.html = verifyEmail({otp:data.otp,title:"Forget Password", useCid: true});
        } else {
            data.html = verifyEmail({otp:data.otp,title:"Forget Password"});
        }
        
        await  sendEmail(data)

    }
    catch(error){
        console.log(`fail to send email`,error);
        
    }

})
