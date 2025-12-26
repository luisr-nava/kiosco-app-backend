import { Module } from '@nestjs/common';
import { CashRegisterController } from './cash-register.controller';
import { CashRegisterService } from './cash-register.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CashRegisterExportPdfService } from './cash-register-export-pdf.service';
import { CashRegisterExportExcelService } from './cash-register-export-excel.service';
import { CashRegisterExportDataService } from './cash-register-export-data.service';
import { CashRegisterExportController } from './cash-register-export.controller';
import { CashRegisterExportCacheService } from './cash-register-export-cache.service';
import { CashRegisterExportService } from './cash-register-export.service';
import { CashRegisterAccessService } from './cash-register-access.service';
import { PrivateStorageService } from '../storage/private-storage.service';
import { MailService } from '../common/mail.service';
import { ReportDistributionService } from './report-distribution.service';
import { CashRegisterReportsController } from './cash-register-reports.controller';
import { CashRegisterReportsService } from './cash-register-reports.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    CashRegisterReportsController,
    CashRegisterExportController,
    CashRegisterController,
  ],
  providers: [
    CashRegisterService,
    CashRegisterExportPdfService,
    CashRegisterExportExcelService,
    CashRegisterExportDataService,
    CashRegisterAccessService,
    CashRegisterExportCacheService,
    CashRegisterExportService,
    PrivateStorageService,
    MailService,
    ReportDistributionService,
    CashRegisterReportsService,
  ],
  exports: [CashRegisterService],
})
export class CashRegisterModule {}
