import nodemailer from "nodemailer"
import { CustomError } from "../Customs/CustomError.mjs";

export class EmailHelper{
    
    constructor(gmailUser, gmailAuth){
        this.getGmailUser = () => {return gmailUser}
        this.transporter = this.createTransporter(gmailUser, gmailAuth)
    }

    createTransporter(gmailUser, gmailAuth){
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: gmailUser,
              pass: gmailAuth
            }
        });
        return transporter
    }

    createEmailWithHtml = (sendEmail, subjetct, text, html) =>{
        let email = this.createEmail(sendEmail, subjetct, text)
        email.html = html
        return email
    }

    createEmail = (sendEmail, subjetct, text) =>{
        const email = {
            from: this.getGmailUser(),
            to: sendEmail,
            subject: subjetct,
            text: text
        }
        this.validateEmail(email)
        return email
    }

    validateEmail(email){
        if (email.to == null){
            throw CustomError.EmailPropertyNotFound("to")
        }
        if(email.subject == null){
            throw CustomError.EmailPropertyNotFound("subject")
        }
        if(email.text == null && email.htm == null){
            throw CustomError.EmailPropertyNotFound("text and html")
        }
    }

    async sendMail(email){
        let resp = await this.transporter.sendMail(email)
        return resp
    }

}