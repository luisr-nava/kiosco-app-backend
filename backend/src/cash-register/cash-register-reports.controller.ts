import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth-client/guards/jwt-auth.guard';
import { GetUser } from '../auth-client/decorators/get-user.decorator';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';
import { CashRegisterExportService } from './cash-register-export.service';
import { CashRegisterReportsService } from './cash-register-reports.service';

type ReportPeriod = 'day' | 'week' | 'month' | 'year';

@UseGuards(JwtAuthGuard)
@Controller('cash-register')
export class CashRegisterReportsController {
  constructor(
    private readonly exportService: CashRegisterExportService,
    private readonly reportService: CashRegisterReportsService,
  ) {}

  @Get(':id/report/pdf')
  async downloadPdf(
    @Param('id') cashRegisterId: string,
    @Res({ passthrough: true }) res: Response,
    @GetUser() user: JwtPayload,
  ) {
    const exportData = await this.exportService.exportPdf(cashRegisterId, user);
    res.setHeader('Content-Type', exportData.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${exportData.filename}"`,
    );
    res.setHeader('Content-Length', exportData.buffer.length.toString());
    res.send(exportData.buffer);
  }

  @Get(':id/report/excel')
  async downloadExcel(
    @Param('id') cashRegisterId: string,
    @Res({ passthrough: true }) res: Response,
    @GetUser() user: JwtPayload,
  ) {
    const exportData = await this.exportService.exportExcel(
      cashRegisterId,
      user,
    );
    res.setHeader('Content-Type', exportData.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${exportData.filename}"`,
    );
    res.setHeader('Content-Length', exportData.buffer.length.toString());
    res.send(exportData.buffer);
  }

  @Get('reports')
  listReports(
    @Query('period') period: ReportPeriod,
    @Query('date') date: string | undefined,
    @Query('year') year: string | undefined,
    @Query('month') month: string | undefined,
    @Query('week') week: string | undefined,
    @GetUser() user: JwtPayload,
  ) {
    if (!period) {
      throw new BadRequestException('El periodo es obligatorio');
    }
    return this.reportService.listReports(
      period,
      { date, year, month, week },
      user,
    );
  }
}
