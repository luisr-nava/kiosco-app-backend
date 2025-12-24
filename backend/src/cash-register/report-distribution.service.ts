import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CashRegisterExportService } from './cash-register-export.service';
import { MailService } from '../common/mail.service';
import { envs } from '../config/envs';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';

@Injectable()
export class ReportDistributionService {
  private readonly logger = new Logger(ReportDistributionService.name);

  constructor(
    private readonly exportService: CashRegisterExportService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async distributeOnClose(cashRegisterId: string, user: JwtPayload) {
    const cashRegister = await this.prisma.cashRegister.findUnique({
      where: { id: cashRegisterId },
      select: {
        id: true,
        status: true,
        closedAt: true,
        shop: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!cashRegister) {
      this.logger.warn(`No se encontró la caja ${cashRegisterId} para distribuir el reporte`);
      return;
    }

    if (cashRegister.status !== 'CLOSED') {
      return;
    }

    const recipient = envs.reportsNotificationEmail;
    if (!recipient) {
      this.logger.warn('No está configurado REPORTS_NOTIFICATION_EMAIL, se omite el envío de correos');
      return;
    }

    const formattedDate = this.formatDate(cashRegister.closedAt ?? new Date());

    try {
      const [pdfExport, excelExport] = await Promise.all([
        this.exportService.exportPdf(cashRegisterId, user),
        this.exportService.exportExcel(cashRegisterId, user),
      ]);

      await this.mailService.sendMail({
        to: recipient,
        subject: `Arqueo de caja – ${formattedDate}`,
        text: `Se adjunta el arqueo de caja de ${cashRegister.shop.name} correspondiente al ${formattedDate}.`,
        attachments: [
          {
            filename: `arqueo-${formattedDate}.pdf`,
            content: pdfExport.buffer,
            contentType: pdfExport.contentType,
          },
          {
            filename: `arqueo-${formattedDate}.xlsx`,
            content: excelExport.buffer,
            contentType: excelExport.contentType,
          },
        ],
      });
    } catch (error) {
      this.logger.warn(
        `No se pudo enviar el arqueo por correo para la caja ${cashRegisterId}`,
        error as Error,
      );
    }
  }

  private formatDate(date: Date) {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }
}
