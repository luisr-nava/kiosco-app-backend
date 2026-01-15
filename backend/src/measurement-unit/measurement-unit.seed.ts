import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MeasurementBaseUnit, MeasurementUnitCategory } from '@prisma/client';

@Injectable()
export class MeasurementUnitSeed implements OnModuleInit {
  private readonly logger = new Logger(MeasurementUnitSeed.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureBaseUnits();
  }

  private async ensureBaseUnits() {
    const baseUnits = [
      {
        name: 'Kilogramo',
        code: 'KG',
        category: MeasurementUnitCategory.WEIGHT,
        baseUnit: MeasurementBaseUnit.KG,
      },
      {
        name: 'Litro',
        code: 'L',
        category: MeasurementUnitCategory.VOLUME,
        baseUnit: MeasurementBaseUnit.L,
      },
      {
        name: 'Unidad',
        code: 'UNIT',
        category: MeasurementUnitCategory.UNIT,
        baseUnit: MeasurementBaseUnit.UNIT,
      },
    ];

    for (const unit of baseUnits) {
      const exists = await this.prisma.measurementUnit.findFirst({
        where: {
          baseUnit: unit.baseUnit,
          isBaseUnit: true,
        },
      });

      if (!exists) {
        await this.prisma.measurementUnit.create({
          data: {
            name: unit.name,
            code: unit.code,
            category: unit.category,
            baseUnit: unit.baseUnit,
            isBaseUnit: true,
            isDefault: true,
            conversionFactor: 1,
            createdByUserId: null,
          },
        });

        this.logger.log(`Unidad base creada: ${unit.code}`);
      }
    }
  }
}
