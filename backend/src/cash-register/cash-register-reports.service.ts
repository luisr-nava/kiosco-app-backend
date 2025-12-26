import { BadRequestException, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';
import { CashRegisterAccessService } from './cash-register-access.service';
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  isAfter,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns';

type ReportPeriod = 'day' | 'week' | 'month' | 'year';

type ReportQuery = {
  date?: string;
  year?: string;
  month?: string;
  week?: string;
  dateFrom?: string;
  dateTo?: string;
};

@Injectable()
export class CashRegisterReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: CashRegisterAccessService,
  ) {}

  async listReports(
    period: ReportPeriod,
    params: ReportQuery,
    user: JwtPayload,
  ) {
    const { start, end } = this.buildDateRange(period, params);
    const accessibleShopIds = await this.accessService.getAccessibleShopIds(
      user,
    );

    if (!accessibleShopIds.length) {
      return {
        data: [],
        message: 'No hay datos en el período seleccionado',
      };
    }

    const where: Prisma.CashRegisterWhereInput = {
      status: 'CLOSED',
      closedAt: {
        gte: start,
        lte: end,
      },
      shopId: { in: accessibleShopIds },
    };

    const registers = await this.prisma.cashRegister.findMany({
      where,
      include: {
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        closedAt: 'desc',
      },
    });

    const data = registers.map((register) => {
      const difference = register.difference ?? 0;
      const closingAmount = register.actualAmount ?? register.closingAmount;
      const status =
        difference > 0 ? 'SOBRANTE' : difference < 0 ? 'FALTANTE' : 'EXACTO';

      return {
        cashRegisterId: register.id,
        shopId: register.shopId,
        shopName: register.shop.name,
        openedAt: register.openedAt,
        closedAt: register.closedAt,
        responsible: register.openedByName ?? null,
        openingAmount: register.openingAmount,
        closingAmount: closingAmount ?? null,
        difference,
        status,
      };
    });

    if (!data.length) {
      return {
        data,
        message: 'No hay datos en el período seleccionado',
      };
    }

    return { data };
  }

  private buildDateRange(period: ReportPeriod, query: ReportQuery) {
    switch (period) {
      case 'day':
        return this.buildDayRange(query.date);
      case 'week':
        return this.buildWeekRange(query);
      case 'month':
        return this.buildMonthRange(query);
      case 'year':
        return this.buildYearRange(query);
      default:
        throw new BadRequestException('Periodo inválido');
    }
  }

  private buildDayRange(date?: string) {
    if (!date) {
      throw new BadRequestException(
        'La fecha es obligatoria para el periodo diario',
      );
    }

    const parsed = parseISO(date);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException('Fecha inválida');
    }

    return {
      start: startOfDay(parsed),
      end: endOfDay(parsed),
    };
  }

  private buildWeekRange(query: ReportQuery) {
    const now = new Date();
    const dateFrom = query.dateFrom
      ? this.parseIsoDate(query.dateFrom, 'dateFrom')
      : null;
    const dateTo = query.dateTo
      ? this.parseIsoDate(query.dateTo, 'dateTo')
      : null;

    if (!dateFrom && !dateTo) {
      const start = startOfWeek(now, { weekStartsOn: 1 });
      const endOfWeekRange = endOfWeek(start, { weekStartsOn: 1 });
      const end = isAfter(endOfWeekRange, now) ? now : endOfWeekRange;
      return { start, end };
    }

    let start: Date;
    let end: Date;

    if (dateFrom && dateTo) {
      start = startOfDay(dateFrom);
      end = endOfDay(dateTo);
    } else if (dateFrom) {
      start = startOfWeek(dateFrom, { weekStartsOn: 1 });
      end = endOfWeek(dateFrom, { weekStartsOn: 1 });
    } else {
      start = startOfWeek(dateTo!, { weekStartsOn: 1 });
      end = endOfWeek(dateTo!, { weekStartsOn: 1 });
    }

    if (isAfter(end, now)) {
      end = now;
    }

    if (isAfter(start, end)) {
      throw new BadRequestException('El rango es inválido');
    }

    if (isAfter(start, now)) {
      this.rejectFutureEnd(start, now);
    }
    return { start, end };
  }

  private buildMonthRange(query: ReportQuery) {
    const now = new Date();
    const monthValue = query.month
      ? Number(query.month)
      : now.getMonth() + 1;
    const yearValue = query.year ? Number(query.year) : now.getFullYear();

    if (
      Number.isNaN(monthValue) ||
      Number.isNaN(yearValue) ||
      monthValue < 1 ||
      monthValue > 12
    ) {
      throw new BadRequestException('Mes o año inválido');
    }

    const reference = new Date(yearValue, monthValue - 1, 1);
    const start = startOfMonth(reference);
    let end = endOfMonth(reference);
    if (isAfter(end, now)) {
      end = now;
    }

    if (isAfter(start, now)) {
      this.rejectFutureEnd(start, now);
    }

    return { start, end };
  }

  private buildYearRange(query: ReportQuery) {
    const now = new Date();
    const yearValue = query.year ? Number(query.year) : now.getFullYear();

    if (Number.isNaN(yearValue)) {
      throw new BadRequestException('Año inválido');
    }

    const reference = new Date(yearValue, 0, 1);
    const start = startOfYear(reference);
    let end = endOfYear(reference);
    if (isAfter(end, now)) {
      end = now;
    }

    if (isAfter(start, now)) {
      this.rejectFutureEnd(start, now);
    }

    return { start, end };
  }

  private parseIsoDate(value: string, label: string) {
    const parsed = parseISO(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`"${label}" inválido`);
    }
    return parsed;
  }

  private rejectFutureEnd(start: Date, now: Date) {
    if (isAfter(start, now)) {
      throw new BadRequestException('El rango no puede ir al futuro');
    }
  }
}
