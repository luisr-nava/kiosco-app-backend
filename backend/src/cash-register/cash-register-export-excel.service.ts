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

    const { cashRegister, totals, responsibleName } = context;

    // =========================
    // HEADER (logo + info)
    // =========================
    for (let i = 1; i <= 4; i++) {
      sheet.getRow(i).height = 20;
    }

    // Logo
    sheet.mergeCells('A1:A4');
    this.insertLogo(sheet, {
      tlCol: 0.3,
      tlRow: 0.5,
      width: 140,
      height: 70,
    });
    sheet.getColumn('A').width = 30;

    // Título
    sheet.mergeCells('B1:J1');
    const titleCell = sheet.getCell('B1');
    titleCell.value = 'Arqueo de Caja';
    titleCell.font = {
      name: 'Calibri',
      size: 18,
      bold: true,
      color: { argb: 'FF1E3A8A' },
    };
    titleCell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };

    // Info
    sheet.mergeCells('B2:J4');
    const infoCell = sheet.getCell('B2');
    infoCell.value =
      `Tienda: ${cashRegister.shop.name}\n` +
      `Fecha: ${this.formatDateOnly(cashRegister.openedAt)}\n` +
      `Responsable: ${responsibleName ?? 'N/D'}`;

    infoCell.font = {
      name: 'Calibri',
      size: 14,
    };
    infoCell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };

    // =========================
    // TABLA
    // =========================
    sheet.addRow([]);
    sheet.getColumn('B').width = 24;
    sheet.getColumn('C').width = 24;
    sheet.getColumn('D').width = 24;
    sheet.getColumn('E').width = 24;
    sheet.getColumn('F').width = 24;
    sheet.getColumn('G').width = 24;
    sheet.getColumn('H').width = 24;
    sheet.getColumn('I').width = 24;
    sheet.getColumn('J').width = 24;

    const tableHeader = sheet.addRow([
      'Fecha',
      'Hora de apertura',
      'Monto de apertura',
      'Total ingresos',
      'Total egresos',
      'Balance esperado',
      'Balance real',
      'Diferencia',
      'Hora de cierre',
      'Total en caja',
    ]);

    tableHeader.font = {
      bold: true,
      name: 'Calibri',
      size: 13,
    };

    tableHeader.eachCell((cell) => {
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
    });

    const expectedBalance = cashRegister.closingAmount ?? totals.expectedAmount;

    const opened = this.splitDateTime(cashRegister.openedAt);
    const closed = cashRegister.closedAt
      ? this.splitDateTime(cashRegister.closedAt)
      : null;

    const dataRow = sheet.addRow([
      this.formatDateOnly(cashRegister.openedAt),
      opened.time,
      cashRegister.openingAmount,
      totals.totalIncome,
      totals.totalExpense,
      expectedBalance,
      cashRegister.actualAmount ?? 0,
      cashRegister.difference ?? 0,
      closed?.time ?? '-',
      cashRegister.actualAmount ?? 0,
    ]);

    dataRow.eachCell((cell, col) => {
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };

      // Columnas con moneda
      if ([3, 4, 5, 6, 7, 8, 10].includes(col)) {
        cell.numFmt = currencyFormat;
      }

      // Diferencia negativa en rojo
      if (col === 8 && typeof cell.value === 'number' && cell.value < 0) {
        cell.font = { color: { argb: 'FFDC2626' } };
      }
    });

    // =========================
    // FREEZE + PROTECCIÓN
    // =========================
    sheet.views = [{ state: 'frozen', ySplit: tableHeader.number }];

    this.unlockSheetCells(sheet);
    const lockColumns = Math.max(sheet.columnCount, 10);
    this.lockCellRange(sheet, 1, 1, tableHeader.number, lockColumns);
    this.protectSheet(sheet);
  }

  private buildMovementsSheet(
    workbook: ExcelJS.Workbook,
    context: CashRegisterExportContext,
    currencyFormat: string,
  ) {
    const sheet = workbook.addWorksheet('Movimientos');
    const formattedDate = this.formatDateOnly(new Date());
    const responsibleText = context.responsibleName ?? 'No disponible';
    // Aseguramos que existan las filas
    for (let i = 1; i <= 4; i++) {
      sheet.getRow(i).height = 20;
    }

    // Merge visual de celdas
    sheet.mergeCells('A1:A4');
    this.insertLogo(sheet, {
      tlCol: 0.3, // ⬅️ empuja a la derecha
      tlRow: 0.5, // ⬇️ empuja hacia abajo
      width: 140,
      height: 70,
    });
    sheet.getColumn('A').width = 30;

    sheet.mergeCells('B1:E1');

    const titleCell = sheet.getCell('B1');
    titleCell.value = 'Detalle de movimientos';
    titleCell.font = {
      name: 'Calibri',
      size: 18, // 👈 más grande
      bold: true,
    };
    titleCell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };

    sheet.getColumn('B').width = 20;
    sheet.getColumn('C').width = 20;
    sheet.getColumn('D').width = 40;
    sheet.getColumn('E').width = 40;

    sheet.mergeCells('B2:E4');

    const infoText =
      `Tienda: ${context.cashRegister.shop.name}\n` +
      `Fecha: ${formattedDate}\n` +
      `Responsable: ${responsibleText}`;

    const infoCell = sheet.getCell('B2');
    infoCell.value = infoText;
    infoCell.font = {
      name: 'Calibri',
      size: 14, // 👈 más chico que el título
    };
    infoCell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };

    const header = sheet.addRow([]);
    header.hidden = true;
    sheet.addRow([]);
    const tableHeader = sheet.addRow([
      'Fecha',
      'Hora',
      'Tipo',
      'Referencia',
      'Monto',
    ]);
    tableHeader.font = { bold: true, name: 'Calibri', size: 14 };

    sheet.views = [{ state: 'frozen', ySplit: tableHeader.number }];

    context.cashRegister.movements.forEach((movement) => {
      const { date, time } = this.splitDateTime(movement.createdAt);

      const amount =
        movement.type === 'OPENING'
          ? movement.amount
          : this.getSignedAmount(movement.type, movement.amount);

      const row = sheet.addRow([
        date,
        time,
        this.mapMovementType(movement.type),
        this.getMovementReference(movement),
        amount,
      ]);

      for (let col = 1; col <= 5; col++) {
        // A=1, E=5
        const cell = sheet.getCell(7, col);
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
        };
      }
      for (let row = 8; row <= 9; row++) {
        for (let col = 1; col <= 4; col++) {
          // A=1, D=4
          const cell = sheet.getCell(row, col);
          cell.alignment = {
            horizontal: 'center',
            vertical: 'middle',
          };
        }
      }
      row.getCell(5).numFmt = currencyFormat;

      if (amount < 0) {
        row.getCell(5).font = { color: { argb: 'FFDC2626' } };
      }
    });
    if (context.cashRegister.closedAt) {
      const { date, time } = this.splitDateTime(context.cashRegister.closedAt);

      const closeRow = sheet.addRow([
        date,
        time,
        'Cierre',
        'Cierre de caja',
        context.cashRegister.actualAmount,
      ]);

      closeRow.getCell(5).numFmt = currencyFormat;

      // 🎨 estilo visual para destacar el cierre
      closeRow.font = { bold: true };
      closeRow.getCell(5).font = {
        bold: true,
        color: { argb: 'FF16A34A' }, // verde
      };

      closeRow.eachCell((cell) => {
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
        };
      });
    }

    const lockColumns = Math.max(sheet.columnCount, 7);
    const headerRowsToLock = 4;
    this.unlockSheetCells(sheet);
    this.lockCellRange(sheet, 1, 1, 2, lockColumns);
    this.lockCellRange(sheet, 1, 3, headerRowsToLock, lockColumns);
    this.lockCellRange(
      sheet,
      tableHeader.number,
      1,
      tableHeader.number,
      lockColumns,
    );
    this.protectSheet(sheet);
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

  private formatDateOnly(date: Date | string) {
    const dt = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
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

  private unlockSheetCells(sheet: ExcelJS.Worksheet) {
    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.protection = { locked: false };
      });
    });
  }

  private lockCellRange(
    sheet: ExcelJS.Worksheet,
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number,
  ) {
    for (let row = startRow; row <= endRow; row += 1) {
      for (let col = startCol; col <= endCol; col += 1) {
        sheet.getCell(row, col).protection = { locked: true };
      }
    }
  }

  private protectSheet(sheet: ExcelJS.Worksheet) {
    void sheet.protect('', {
      selectLockedCells: true,
      selectUnlockedCells: true,
      formatCells: false,
      formatColumns: false,
      formatRows: false,
      insertColumns: false,
      insertRows: false,
      deleteColumns: false,
      deleteRows: false,
      sort: false,
      autoFilter: false,
      objects: false,
      scenarios: false,
    });
  }

  private insertLogo(
    sheet: ExcelJS.Worksheet,
    options?: {
      tlRow?: number;
      tlCol?: number;
      brRow?: number;
      brCol?: number;
      width?: number;
      height?: number;
    },
  ) {
    const logo = this.getLogoBuffer();
    if (!logo) {
      return;
    }

    const imageId = sheet.workbook.addImage({
      base64: logo.toString('base64'),
      extension: 'png',
    });

    const imageOptions: ExcelJS.ImagePosition = {
      tl: {
        col: options?.tlCol ?? 0,
        row: options?.tlRow ?? 0,
      },
      ext: {
        width: options?.width ?? 160,
        height: options?.height ?? 60,
      },
    };

    sheet.addImage(imageId, imageOptions);
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
  private splitDateTime(date: Date) {
    const d = new Date(date);
    return {
      date: new Intl.DateTimeFormat('es-ES').format(d),
      time: new Intl.DateTimeFormat('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(d),
    };
  }
}
