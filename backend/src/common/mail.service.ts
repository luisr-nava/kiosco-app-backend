import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
import { envs } from '../config/envs';

export type MailAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor() {
    if (!envs.mailHost || !envs.mailPort) {
      this.logger.warn(
        'Mail host/port not configured, skipping email initialization',
      );
      return;
    }

    const port = Number(envs.mailPort);
    if (Number.isNaN(port)) {
      this.logger.warn(`Mail port is not a valid number: ${envs.mailPort}`);
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: envs.mailHost,
      port,
      secure: envs.mailSecure === 'true',
      auth:
        envs.mailUser && envs.mailPassword
          ? { user: envs.mailUser, pass: envs.mailPassword }
          : undefined,
    });
  }

  async sendMail(options: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    attachments?: MailAttachment[];
  }) {
    if (!this.transporter) {
      this.logger.warn('Mailer not configured, skipping email send');
      return;
    }

    try {
      await this.transporter.sendMail({
        from:
          envs.reportsFromEmail || envs.reportsNotificationEmail || undefined,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments?.map((attachment) => ({
          filename: attachment.filename,
          content: attachment.content,
          contentType: attachment.contentType,
        })),
      });
    } catch (error) {
      this.logger.error('Error while sending email', error as Error);
      throw error;
    }
  }
}
