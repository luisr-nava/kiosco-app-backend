import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { existsSync, readFileSync } from 'fs';
import path from 'node:path';
import { Buffer as NodeBuffer } from 'node:buffer';
import type { CashMovementType } from '@prisma/client';
import { CashRegisterExportDataService } from './cash-register-export-data.service';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';
import type { CashRegisterExportContext } from './cash-register-export-data.service';

@Injectable()
export class CashRegisterExportExcelService {
  private logoBuffer: NodeBuffer | null = null;

  constructor(private readonly dataService: CashRegisterExportDataService) {}

  async generate(cashRegisterId: string, user: JwtPayload) {
    const context = await this.dataService.getClosedCashRegisterContext(
      cashRegisterId,
      user,
    );

    const workbook = new ExcelJS.Workbook();
    const currency = context.cashRegister.shop.currencyCode || 'USD';
    const currencyFormat = this.getCurrencyFormat(currency);

    this.buildSummarySheet(workbook, context, currencyFormat);
    this.buildMovementsSheet(workbook, context, currencyFormat);

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private buildSummarySheet(
    workbook: ExcelJS.Workbook,
    context: CashRegisterExportContext,
    currencyFormat: string,
  ) {
    const sheet = workbook.addWorksheet('Resumen');
    this.insertLogo(sheet);

    sheet.addRow([]);
    sheet.addRow([{ value: 'Arqueo de Caja', font: { bold: true, size: 15 } }]);
    sheet.addRow([]);
    const headerRow = sheet.addRow(['Campo', 'Valor']);
    headerRow.font = { bold: true };

    const { cashRegister, totals, responsibleName } = context;
    const expectedBalance = cashRegister.closingAmount ?? totals.expectedAmount;

    const rows: Array<[string, string | number]> = [
      ['Tienda', cashRegister.shop.name],
      ['Responsable', responsibleName ?? 'N/D'],
      ['Fecha apertura', this.formatDateTime(cashRegister.openedAt)],
      [
        'Fecha cierre',
        this.formatDateTime(cashRegister.closedAt ?? new Date()),
      ],
      ['Monto de apertura', cashRegister.openingAmount],
      ['Total ingresos', totals.totalIncome],
      ['Total egresos', totals.totalExpense],
      ['Balance esperado', expectedBalance],
      ['Balance real', cashRegister.actualAmount ?? 0],
      ['Diferencia', cashRegister.difference ?? 0],
    ];

    rows.forEach(([label, value]) => {
      const row = sheet.addRow([label, value]);
      if (typeof value === 'number') {
        row.getCell(2).numFmt = currencyFormat;
      }
    });

    sheet.views = [{ state: 'frozen', ySplit: headerRow.number }];
    this.autoWidth(sheet);
  }

  private buildMovementsSheet(
    workbook: ExcelJS.Workbook,
    context: CashRegisterExportContext,
    currencyFormat: string,
  ) {
    const sheet = workbook.addWorksheet('Movimientos');
    this.insertLogo(sheet);

    sheet.addRow([]);
    sheet.addRow([
      { value: 'Detalle de movimientos', font: { bold: true, size: 15 } },
    ]);
    sheet.addRow([]);

    const header = sheet.addRow([
      'Fecha',
      'Tipo',
      'Referencia',
      'Ingreso',
      'Egreso',
      'Balance parcial',
      'Usuario',
    ]);
    header.font = { bold: true };

    sheet.views = [{ state: 'frozen', ySplit: header.number }];

    let runningBalance = context.cashRegister.openingAmount;

    context.cashRegister.movements.forEach((movement) => {
      const signedAmount = this.getSignedAmount(movement.type, movement.amount);
      runningBalance += signedAmount;
      const incomeAmount =
        movement.type === 'OPENING'
          ? movement.amount
          : signedAmount > 0
            ? signedAmount
            : null;
      const expenseAmount = signedAmount < 0 ? Math.abs(signedAmount) : null;

      const row = sheet.addRow([
        this.formatDateTime(movement.createdAt),
        this.mapMovementType(movement.type),
        this.getMovementReference(movement),
        incomeAmount,
        expenseAmount,
        runningBalance,
        movement.userId,
      ]);

      row.getCell(4).numFmt = currencyFormat;
      row.getCell(5).numFmt = currencyFormat;
      row.getCell(6).numFmt = currencyFormat;
    });

    this.autoWidth(sheet);
  }

  private getMovementReference(
    movement: CashRegisterExportContext['cashRegister']['movements'][number],
  ) {
    if (movement.sale) {
      return `Venta #${movement.sale.id.substring(0, 8)}`;
    }

    if (movement.purchase) {
      return `Compra #${movement.purchase.id.substring(0, 8)}`;
    }

    if (movement.saleReturn) {
      return `Devolución #${movement.saleReturn.id.substring(0, 8)}`;
    }

    if (movement.income) {
      return (
        movement.income.description ||
        `Ingreso #${movement.income.id.substring(0, 8)}`
      );
    }

    if (movement.expense) {
      return (
        movement.expense.description ||
        `Gasto #${movement.expense.id.substring(0, 8)}`
      );
    }

    return movement.description ?? '-';
  }

  private mapMovementType(type: CashMovementType) {
    switch (type) {
      case 'SALE':
        return 'Venta';
      case 'PURCHASE':
        return 'Compra';
      case 'RETURN':
        return 'Devolución';
      case 'INCOME':
        return 'Ingreso';
      case 'EXPENSE':
        return 'Gasto';
      case 'OPENING':
        return 'Apertura';
      case 'WITHDRAWAL':
        return 'Retiro';
      case 'DEPOSIT':
        return 'Depósito';
      case 'ADJUSTMENT':
        return 'Ajuste';
      default:
        return type;
    }
  }

  private getSignedAmount(type: CashMovementType, amount: number) {
    switch (type) {
      case 'SALE':
      case 'INCOME':
      case 'DEPOSIT':
        return amount;
      case 'PURCHASE':
      case 'RETURN':
      case 'EXPENSE':
      case 'WITHDRAWAL':
        return -amount;
      case 'OPENING':
      case 'ADJUSTMENT':
        return 0;
      default:
        return amount;
    }
  }

  private formatDateTime(date: Date | string) {
    const dt = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(dt);
  }

  private getCurrencyFormat(currency: string) {
    const symbol =
      new Intl.NumberFormat('es-ES', { style: 'currency', currency })
        .formatToParts(0)
        .find((part) => part.type === 'currency')?.value ?? '$';
    return `"${symbol}"#,##0.00`;
  }

  private autoWidth(sheet: ExcelJS.Worksheet) {
    sheet.columns?.forEach((column) => {
      if (!column || typeof column.eachCell !== 'function') {
        return;
      }
      let maxLength = 10;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value;
        const text =
          cellValue === null || cellValue === undefined
            ? ''
            : typeof cellValue === 'object' &&
                cellValue !== null &&
                'text' in (cellValue as unknown as Record<string, unknown>)
              ? String((cellValue as { text: unknown }).text)
              : String(cellValue);
        maxLength = Math.max(maxLength, text.length);
      });
      column.width = maxLength + 2;
    });
  }

  private insertLogo(sheet: ExcelJS.Worksheet) {
    const logo = this.getLogoBuffer();
    if (!logo) {
      return;
    }

    const imageId = sheet.workbook.addImage({
      base64: logo.toString('base64'),
      extension: 'png',
    });

    sheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 160, height: 60 },
    });
  }

  private getLogoBuffer(): NodeBuffer | null {
    if (this.logoBuffer) {
      return this.logoBuffer;
    }

    const candidates = [
      path.resolve(process.cwd(), 'src', 'assets', 'balanzio.png'),
      path.resolve(process.cwd(), 'dist', 'src', 'assets', 'balanzio.png'),
      path.resolve(process.cwd(), 'assets', 'balanzio.png'),
      path.resolve(__dirname, '../assets/balanzio.png'),
    ];

    const logoPath = candidates.find((candidate) => existsSync(candidate));
    if (!logoPath) {
      return null;
    }

    this.logoBuffer = readFileSync(logoPath);
    return this.logoBuffer;
  }
}
