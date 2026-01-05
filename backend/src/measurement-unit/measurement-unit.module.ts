import { Module } from '@nestjs/common';
import { MeasurementUnitService } from './measurement-unit.service';
import { MeasurementUnitController } from './measurement-unit.controller';
import { MeasurementUnitSeed } from './measurement-unit.seed';

@Module({
  controllers: [MeasurementUnitController],
  providers: [MeasurementUnitService, MeasurementUnitSeed],
})
export class MeasurementUnitModule {}
