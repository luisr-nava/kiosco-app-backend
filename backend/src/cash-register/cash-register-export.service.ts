import { Injectable } from '@nestjs/common';
import { CashRegisterExportFormat } from '@prisma/client';
import { CashRegisterExportPdfService } from './cash-register-export-pdf.service';
import { CashRegisterExportExcelService } from './cash-register-export-excel.service';
import { CashRegisterExportCacheService } from './cash-register-export-cache.service';
import { CashRegisterExportDataService } from './cash-register-export-data.service';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';
import type { CachedExport } from './cash-register-export-cache.service';

@Injectable()
export class CashRegisterExportService {
  constructor(
    private readonly pdfService: CashRegisterExportPdfService,
    private readonly excelService: CashRegisterExportExcelService,
    private readonly cacheService: CashRegisterExportCacheService,
    private readonly dataService: CashRegisterExportDataService,
  ) {}

  async exportPdf(
    cashRegisterId: string,
    user: JwtPayload,
  ): Promise<CachedExport> {
    const cached = await this.cacheService.findValidExport(
      cashRegisterId,
      CashRegisterExportFormat.PDF,
    );
    if (cached) {
      await this.dataService.getClosedCashRegisterContext(cashRegisterId, user);
      return cached;
    }

    const buffer = await this.pdfService.generate(cashRegisterId, user);
    return this.cacheService.storeExport(
      cashRegisterId,
      CashRegisterExportFormat.PDF,
      buffer,
      'application/pdf',
    );
  }

  async exportExcel(
    cashRegisterId: string,
    user: JwtPayload,
  ): Promise<CachedExport> {
    const cached = await this.cacheService.findValidExport(
      cashRegisterId,
      CashRegisterExportFormat.EXCEL,
    );
    if (cached) {
      await this.dataService.getClosedCashRegisterContext(cashRegisterId, user);
      return cached;
    }

    const buffer = await this.excelService.generate(cashRegisterId, user);
    return this.cacheService.storeExport(
      cashRegisterId,
      CashRegisterExportFormat.EXCEL,
      buffer,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
  }
}
