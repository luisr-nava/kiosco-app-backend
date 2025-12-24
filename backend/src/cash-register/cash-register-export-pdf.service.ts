import { Injectable } from '@nestjs/common';
import PdfPrinter from 'pdfmake';
import type {
  Content,
  ContentColumns,
  TableCell,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';
import { existsSync, readFileSync } from 'fs';
import path from 'node:path';
import type { CashMovementType } from '@prisma/client';
import { CashRegisterExportDataService } from './cash-register-export-data.service';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';
import type { CashRegisterExportContext } from './cash-register-export-data.service';
import type PDFKit from 'pdfkit';

const palette = {
  background: '#0f172a',
  surface: '#111827',
  rowAlt: '#0b1221',
  border: '#1f2937',
  textPrimary: '#e5e7eb',
  textMuted: '#9ca3af',
  accent: '#1e3a8a',
};

@Injectable()
export class CashRegisterExportPdfService {
  private logoDataUrl: string | null = null;

  constructor(private readonly dataService: CashRegisterExportDataService) {}

  async generate(cashRegisterId: string, user: JwtPayload) {
    const context = await this.dataService.getClosedCashRegisterContext(
      cashRegisterId,
      user,
    );

    const printer = new PdfPrinter({
      Roboto: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique',
      },
    });

    const docDefinition: TDocumentDefinitions = this.buildDocument(context);
    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    return this.buildBuffer(pdfDoc);
  }

  private buildDocument(
    context: CashRegisterExportContext,
  ): TDocumentDefinitions {
    const { cashRegister, totals, differenceStatus, responsibleName } = context;
    type MovementWithMeta =
      CashRegisterExportContext['cashRegister']['movements'][number] & {
        formattedDate: string;
        formattedTime: string;
        isClosing?: boolean;
      };
    const movements: MovementWithMeta[] = [...cashRegister.movements]
      .slice(0, 50)
      .map((movement) => {
        const [formattedDate, formattedTime] = this.formatDateAndTime(
          movement.createdAt,
        );
        return {
          ...movement,
          formattedDate,
          formattedTime,
        };
      });

    // Agregar evento de cierre como último movimiento
    if (cashRegister.closedAt) {
      const [closeDate, closeTime] = this.formatDateAndTime(
        cashRegister.closedAt,
      );
      const closingAmount =
        cashRegister.actualAmount ?? cashRegister.closingAmount ?? 0;
      movements.push({
        id: 'cash-register-close',
        type: 'ADJUSTMENT',
        amount: closingAmount,
        description: 'Cierre de caja',
        createdAt: cashRegister.closedAt,
        formattedDate: closeDate,
        formattedTime: closeTime,
        userId: cashRegister.closedBy ?? cashRegister.employeeId,
        sale: null,
        purchase: null,
        saleReturn: null,
        income: null,
        expense: null,
        shopId: cashRegister.shopId,
        cashRegisterId: cashRegister.id,
        saleId: null,
        purchaseId: null,
        saleReturnId: null,
        incomeId: null,
        expenseId: null,
      });
    }

    const currency = cashRegister.shop.currencyCode || 'USD';
    const responsibleText = responsibleName
      ? `Responsable: ${responsibleName}`
      : 'Responsable: No disponible';
    const movementRows = movements.map((movement) => {
      const isClosing = movement.id === 'cash-register-close';
      const signedAmount = isClosing
        ? movement.amount
        : movement.type === 'OPENING'
          ? movement.amount
          : this.getSignedAmount(movement.type, movement.amount);

      return {
        date: movement.formattedDate,
        time: movement.formattedTime,
        type: isClosing ? 'Cierre' : this.mapMovementType(movement.type),
        reference: this.getMovementReference(movement),
        amount: this.formatCurrency(signedAmount, currency),
        user: movement.userId,
      };
    });

    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 60] as [number, number, number, number],
      footer: (currentPage, pageCount) => ({
        columns: [
          {
            text: 'Documento generado automáticamente por Balanzio',
            alignment: 'left',
          },
          { text: `${currentPage} / ${pageCount}`, alignment: 'right' },
        ],
        margin: [40, 0, 40, 0] as [number, number, number, number],
        fontSize: 9,
        color: palette.textMuted,
      }),
      content: [
        this.buildHeader(context, responsibleText),
        { text: 'Resumen del arqueo', style: 'sectionTitle' },
        {
          table: {
            widths: ['*', 'auto'],
            body: [
              [
                'Monto de apertura',
                this.formatCurrency(cashRegister.openingAmount, currency),
              ],
              [
                'Total ingresos',
                this.formatCurrency(totals.totalIncome, currency),
              ],
              [
                'Total egresos',
                this.formatCurrency(totals.totalExpense, currency),
              ],
              [
                'Balance esperado',
                this.formatCurrency(
                  cashRegister.closingAmount ?? totals.expectedAmount,
                  currency,
                ),
              ],
              [
                'Monto real declarado',
                this.formatCurrency(cashRegister.actualAmount ?? 0, currency),
              ],
              [
                'Diferencia',
                this.formatCurrency(cashRegister.difference ?? 0, currency),
              ],
              ['Estado del cierre', differenceStatus],
            ],
          },
          layout: {
            fillColor: (rowIndex: number) =>
              rowIndex % 2 === 0 ? '#f9fafb' : null,
            hLineColor: () => '#e5e7eb',
            vLineColor: () => '#e5e7eb',
          },
        },
        {
          text: 'Totales por tipo de movimiento',
          style: 'sectionTitle',
          margin: [0, 12, 0, 6] as [number, number, number, number],
        },
        {
          table: {
            widths: ['*', 'auto'],
            body: [
              ['Ventas', this.formatCurrency(totals.sales, currency)],
              [
                'Ingresos',
                this.formatCurrency(totals.incomes + totals.deposits, currency),
              ],
              [
                'Gastos',
                this.formatCurrency(
                  totals.expenses + totals.purchases + totals.withdrawals,
                  currency,
                ),
              ],
              ['Devoluciones', this.formatCurrency(totals.returns, currency)],
            ],
          },
          layout: {
            fillColor: (rowIndex: number) =>
              rowIndex % 2 === 0 ? '#f9fafb' : null,
            hLineColor: () => '#e5e7eb',
            vLineColor: () => '#e5e7eb',
          },
          margin: [0, 8, 0, 12],
        },
        ...(movements.length
          ? [
              {
                text: 'Movimientos (máx 50)',
                style: 'sectionTitle',
                margin: [0, 8, 0, 12] as [number, number, number, number],
              },
              {
                table: {
                  headerRows: 1,
                  widths: ['15%', '8%', '20%', '*', '20%'] as [
                    string,
                    string,
                    string,
                    string,
                    string,
                  ],
                  body: [
                    this.buildMovementsHeaderRow(),
                    ...movementRows.map((row) =>
                      this.buildMovementsBodyRow(row),
                    ),
                  ],
                },
                layout: {
                  fillColor: (rowIndex: number) =>
                    rowIndex === 0
                      ? '#e5e7eb'
                      : rowIndex % 2 === 0
                        ? '#f9fafb'
                        : null,
                  hLineColor: () => '#e5e7eb',
                  vLineColor: () => '#e5e7eb',
                },
                margin: [0, 0, 0, 12] as [number, number, number, number],
              },
            ]
          : []),
        ...(cashRegister.closingNotes
          ? [
              {
                text: 'Observaciones del cierre',
                style: 'sectionTitle',
                margin: [0, 12, 0, 4] as [number, number, number, number],
              },
              {
                text: cashRegister.closingNotes,
                margin: [0, 0, 0, 8] as [number, number, number, number],
              },
            ]
          : []),
      ],
      styles: {
        sectionTitle: {
          fontSize: 14,
          bold: true,
          margin: [0, 8, 0, 12],
          color: '#111827',
        },
        infoGrid: { margin: [0, 2, 0, 2], fontSize: 11 },
        headerTitle: { fontSize: 18, bold: true, color: '#111827' },
        subHeader: { fontSize: 11, color: '#374151', margin: [0, 2, 0, 0] },
      },
      defaultStyle: {
        font: 'Roboto',
        fontSize: 11,
        color: '#1f2937',
      },
    };

    return docDefinition;
  }

  private buildHeader(
    context: CashRegisterExportContext,
    responsibleText: string,
  ): Content {
    const { cashRegister } = context;
    const logo = this.getLogoDataUrl();
    const emissionDate = this.formatDateOnly(new Date());

    const columns: ContentColumns = {
      columns: [
        logo
          ? {
              image: logo,
              width: 110,
              margin: [0, 0, 12, 0] as [number, number, number, number],
            }
          : { text: '' },
        {
          stack: [
            { text: cashRegister.shop.name, style: 'headerTitle' },
            { text: `Fecha: ${emissionDate}`, style: 'subHeader' },
            { text: responsibleText, style: 'subHeader' },
          ],
          width: '*',
        },
      ],
      columnGap: 12,
      margin: [0, 0, 0, 12] as [number, number, number, number],
    };

    return columns;
  }

  private buildMovementsHeaderRow(): TableCell[] {
    return [
      { text: 'Fecha', bold: true, alignment: 'center' },
      { text: 'Hora', bold: true, alignment: 'center' },
      { text: 'Tipo', bold: true, alignment: 'left' },
      { text: 'Referencia', bold: true, alignment: 'left' },
      { text: 'Monto', bold: true, alignment: 'right' },
    ];
  }

  private buildMovementsBodyRow(row: {
    date: string;
    time: string;
    type: string;
    reference: string;
    amount: string;
    user: string;
  }): TableCell[] {
    return [
      { text: row.date, alignment: 'center' },
      { text: row.time, alignment: 'center' },
      { text: row.type, alignment: 'left' },
      { text: row.reference, alignment: 'left' },
      { text: row.amount, alignment: 'right' },
    ];
  }

  private formatCurrency(amount: number, currency: string) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
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

  private formatDateAndTime(date: Date | string): [string, string] {
    const dt = typeof date === 'string' ? new Date(date) : date;
    const datePart = new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(dt);

    const timePart = new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(dt);

    return [datePart, timePart];
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

  private getLogoDataUrl() {
    if (this.logoDataUrl) {
      return this.logoDataUrl;
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

    const fileBuffer = readFileSync(logoPath);
    this.logoDataUrl = `data:image/png;base64,${fileBuffer.toString('base64')}`;
    return this.logoDataUrl;
  }

  private buildBuffer(pdfDoc: PDFKit.PDFDocument): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  }
}
