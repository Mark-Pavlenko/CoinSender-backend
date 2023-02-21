import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as ejs from 'ejs';
import Nodemailer from './interfaces/nodemailer.interface';
import path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NodemailerService {
  constructor(private readonly configService: ConfigService) {}

  private static transporterOptions() {
    return nodemailer.createTransport({
      pool: true,
      service: 'gmail',
      host: 'smtp-mail.outlook.com',
      port: 465,
      secure: false,
      requireTLS: false,
      auth: {
        user: 'hr.manager@megadevllc.com',
        pass: 'ajjerwrlubdrarjy',
      },
    });
  }

  public async sendInvoiceMessageEmail(
    from,
    to,
    subject,
    filename,
    fileContent,
  ) {
    const transporter = NodemailerService.transporterOptions();

    const mailOptions = {
      from: from,
      cc: from,
      to: to,
      subject: subject,
      text: 'You have received an invoice for payment. The invoice file is attached to the letter.',
      attachments: [
        {
          filename: filename,
          content: fileContent,
        },
      ],
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.log(error);
      }
    });
  }

  public async createMessageBodyFromTemplate(
    data,
    templateOptions,
  ): Promise<Nodemailer> {
    try {
      const template = templateOptions.template || '';
      const dataTemplate = templateOptions.data || {};
      const options = templateOptions.options || {};

      data.html = await this.compileEjsTemplate(
        template,
        dataTemplate,
        options,
      );
      return data;
    } catch (err) {
      console.log('createMessageBodyFromTemplate err', err);
      throw new HttpException(
        `${err.detail}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async compileEjsTemplate(template, data, options) {
    try {
      const filePath = path.join(
        process.cwd(),
        `${this.configService.get('TEMPLATES_PATH')}`,
        `${template}.ejs`,
      );
      return await ejs.renderFile(filePath, data, options);
    } catch (err) {
      console.log('compile template err', err);
      throw new HttpException(
        `${err.detail}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async sendMessageToEmail(htmlMessageBodyObj, message) {
    try {
      const transporter = NodemailerService.transporterOptions();

      const mailOptions = {
        from: htmlMessageBodyObj.from,
        to: htmlMessageBodyObj.to,
        subject: htmlMessageBodyObj.subject,
        html: htmlMessageBodyObj.html,
      };

      await transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.log('transporter.sendMail error', error);
          return error;
        }
      });

      return {
        success: true,
        message: message,
      };
    } catch (err) {
      throw new HttpException(
        `${err.detail}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
