import nodemailer, { Transporter } from "nodemailer";
import pug from "pug";
import htmlToText from "html-to-text";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { UserDocument } from "../models/user.model";

const {
  EMAIL_FROM,
  NODE_ENV,
  SENDGRID_USERNAME,
  SENDGRID_PASSWORD,
  MAILTRAP_USERNAME,
  MAILTRAP_PASSWORD,
} = process.env;

interface EmailInterface {
  url: string;
  to: UserDocument["email"];
  // firstname: UserDocument['username'];
  firstname: UserDocument["first_name"];
  from: string;
}

class Email implements EmailInterface {
  url: string;

  to: string;

  firstname: string;

  from: string;

  constructor(user: UserDocument, url: string) {
    this.url = url;
    this.to = user.email;
    // this.firstname = user.username;
    this.firstname = user.first_name as string;
    this.from = `Kolynz Technologies <${EMAIL_FROM}>`;
  }

  newTransport(): Transporter<SMTPTransport.SentMessageInfo> {
    if (NODE_ENV === "production") {
      // SEND GRID
      return nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: SENDGRID_USERNAME,
          pass: SENDGRID_PASSWORD,
        },
      });
    }
    // MAILTRAP
    return nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      auth: {
        user: MAILTRAP_USERNAME,
        pass: MAILTRAP_PASSWORD,
      },
    });
  }

  async send(template: string, subject: string): Promise<void> {
    const html = pug.renderFile(
      `${__dirname}/../templates/email/${template}.pug`,
      {
        firstName: this.firstname,
        url: this.url,
        subject,
      }
    );

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };

    await this.newTransport().sendMail(mailOptions, (err, info) =>
      console.log(err, "......", info)
    );
  }

  async sendWelcome(): Promise<void> {
    await this.send("welcome", "Welcome to the Nest Family!");
  }

  async sendPasswordReset(): Promise<void> {
    await this.send(
      "passwordReset",
      "Your password reset token (valid for 10 min)"
    );
  }
}

export default Email;
