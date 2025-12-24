import { BadRequestException, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';
import {
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns';

type ReportPeriod = 'day' | 'week' | 'month' | 'year';

@Injectable()
export class CashRegisterReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async listReports(
    period: ReportPeriod,
    params: Record<string, string | undefined>,
    user: JwtPayload,
  ) {
    const { start, end } = this.resolveRange(period, params);
    const shopFilter: Prisma.ShopWhereInput = {
      projectId: user.projectId,
    };

    if (user.role === 'OWNER') {
      shopFilter.ownerId = user.id;
    }

    const where: Prisma.CashRegisterWhereInput = {
      status: 'CLOSED',
      closedAt: {
        gte: start,
        lte: end,
      },
      shop: shopFilter,
    };

    if (user.role === 'EMPLOYEE') {
      where.employeeId = user.id;
    }

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

    return registers.map((register) => {
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
  }

  private resolveRange(period: ReportPeriod, params: Record<string, string | undefined>) {
    switch (period) {
      case 'day':
        return this.rangeForDay(params.date);
      case 'week':
        return this.rangeForWeek(params.year, params.week);
      case 'month':
        return this.rangeForMonth(params.year, params.month);
      case 'year':
        return this.rangeForYear(params.year);
      default:
        throw new BadRequestException('Periodo inválido');
    }
  }

  private rangeForDay(date?: string) {
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

  private rangeForWeek(year?: string, week?: string) {
    if (!year || !week) {
      throw new BadRequestException(
        'Año y semana son obligatorios para el periodo semanal',
      );
    }

    const parsedYear = Number(year);
    const parsedWeek = Number(week);

    if (
      Number.isNaN(parsedYear) ||
      Number.isNaN(parsedWeek) ||
      parsedWeek < 1
    ) {
      throw new BadRequestException('Semana o año inválido');
    }

    const reference = startOfWeek(new Date(parsedYear, 0, 1), {
      weekStartsOn: 1,
    });
    const start = addWeeks(reference, parsedWeek - 1);
    return {
      start,
      end: endOfWeek(start, { weekStartsOn: 1 }),
    };
  }

  private rangeForMonth(year?: string, month?: string) {
    if (!year || !month) {
      throw new BadRequestException(
        'Año y mes son obligatorios para el periodo mensual',
      );
    }

    const parsedYear = Number(year);
    const parsedMonth = Number(month);

    if (
      Number.isNaN(parsedYear) ||
      Number.isNaN(parsedMonth) ||
      parsedMonth < 1 ||
      parsedMonth > 12
    ) {
      throw new BadRequestException('Mes o año inválido');
    }

    const reference = new Date(parsedYear, parsedMonth - 1, 1);
    return {
      start: startOfMonth(reference),
      end: endOfMonth(reference),
    };
  }

  private rangeForYear(year?: string) {
    if (!year) {
      throw new BadRequestException(
        'El año es obligatorio para el periodo anual',
      );
    }

    const parsedYear = Number(year);
    if (Number.isNaN(parsedYear)) {
      throw new BadRequestException('Año inválido');
    }

    const reference = new Date(parsedYear, 0, 1);
    return {
      start: startOfYear(reference),
      end: endOfYear(reference),
    };
  }
}
