import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CashRegisterExportFormat } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PrivateStorageService } from '../storage/private-storage.service';

export type CachedExport = {
  buffer: Buffer;
  contentType: string;
  filename: string;
};

@Injectable()
export class CashRegisterExportCacheService {
  private readonly logger = new Logger(CashRegisterExportCacheService.name);
  private readonly ttlMs = 24 * 60 * 60 * 1000; // 24h

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: PrivateStorageService,
  ) {}

  async findValidExport(
    cashRegisterId: string,
    format: CashRegisterExportFormat,
  ): Promise<CachedExport | null> {
    const record = await this.prisma.cashRegisterExport.findFirst({
      where: {
        cashRegisterId,
        format,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return null;
    }

    const file = await this.storage.getFile(record.url);
    if (!file) {
      await this.deleteById(record.id);
      return null;
    }

    return {
      buffer: file,
      contentType: record.contentType,
      filename: this.buildFileName(format, cashRegisterId),
    };
  }

  async storeExport(
    cashRegisterId: string,
    format: CashRegisterExportFormat,
    buffer: Buffer,
    contentType: string,
  ): Promise<CachedExport> {
    const key = this.buildStorageKey(cashRegisterId, format);
    await this.storage.saveFile(key, buffer);

    const expiresAt = new Date(Date.now() + this.ttlMs);

    const record = await this.prisma.cashRegisterExport.create({
      data: {
        cashRegisterId,
        format,
        url: key,
        contentType,
        expiresAt,
      },
    });

    await this.removeStaleExports(cashRegisterId, format, record.id);

    return {
      buffer,
      contentType,
      filename: this.buildFileName(format, cashRegisterId),
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async purgeExpired() {
    const expired = await this.prisma.cashRegisterExport.findMany({
      where: { expiresAt: { lt: new Date() } },
      select: { id: true, url: true },
    });

    if (!expired.length) {
      return;
    }

    await Promise.all(
      expired.map(async (item) => {
        await this.storage.deleteFile(item.url);
        await this.deleteById(item.id);
      }),
    );

    this.logger.log(
      `Purgadas ${expired.length} exportaciones de caja expiradas`,
    );
  }

  private async deleteById(id: string) {
    try {
      await this.prisma.cashRegisterExport.delete({ where: { id } });
    } catch (error) {
      this.logger.warn(
        `No se pudo eliminar cache de exportación ${id}: ${(error as Error).message}`,
      );
    }
  }

  private buildStorageKey(
    cashRegisterId: string,
    format: CashRegisterExportFormat,
  ) {
    return pathJoin(
      'cash-register',
      cashRegisterId,
      `${format.toLowerCase()}-${Date.now()}.bin`,
    );
  }

  private buildFileName(
    format: CashRegisterExportFormat,
    cashRegisterId: string,
  ) {
    const ext = format === 'PDF' ? 'pdf' : 'xlsx';
    return `cash-register-${cashRegisterId}.${ext}`;
  }

  private async removeStaleExports(
    cashRegisterId: string,
    format: CashRegisterExportFormat,
    keepId: string,
  ) {
    const stale = await this.prisma.cashRegisterExport.findMany({
      where: {
        cashRegisterId,
        format,
        id: { not: keepId },
      },
      select: { id: true, url: true },
    });

    if (!stale.length) {
      return;
    }

    await Promise.all(
      stale.map(async (item) => {
        await this.storage.deleteFile(item.url);
        await this.deleteById(item.id);
      }),
    );
  }
}

const pathJoin = (...parts: string[]) => parts.join('/');
