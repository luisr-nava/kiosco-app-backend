import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { CashRegisterExportService } from './cash-register-export.service';
import { JwtAuthGuard } from '../auth-client/guards/jwt-auth.guard';
import { GetUser } from '../auth-client/decorators/get-user.decorator';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';

@UseGuards(JwtAuthGuard)
@Controller('cash-register')
export class CashRegisterExportController {
  constructor(private readonly exportService: CashRegisterExportService) {}

  @Get(':cashRegisterId/export/pdf')
  async exportPdf(
    @Param('cashRegisterId') cashRegisterId: string,
    @GetUser() user: JwtPayload,
    @Res() res: Response,
  ) {
    const exportResult = await this.exportService.exportPdf(
      cashRegisterId,
      user,
    );
    res.setHeader('Content-Type', exportResult.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${exportResult.filename}"`,
    );
    res.send(exportResult.buffer);
  }

  @Get(':cashRegisterId/export/excel')
  async exportExcel(
    @Param('cashRegisterId') cashRegisterId: string,
    @GetUser() user: JwtPayload,
    @Res() res: Response,
  ) {
    const exportResult = await this.exportService.exportExcel(
      cashRegisterId,
      user,
    );
    res.setHeader('Content-Type', exportResult.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${exportResult.filename}"`,
    );
    res.send(exportResult.buffer);
  }
}
