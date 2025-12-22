import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MeasurementUnitService } from './measurement-unit.service';
import { CreateMeasurementUnitDto } from './dto/create-measurement-unit.dto';
import { AssignMeasurementUnitDto } from './dto/assign-measurement-unit.dto';
import { JwtAuthGuard } from '../auth-client/guards/jwt-auth.guard';
import { GetUser } from '../auth-client/decorators/get-user.decorator';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';

@UseGuards(JwtAuthGuard)
@Controller('measurement-units')
export class MeasurementUnitController {
  constructor(
    private readonly measurementUnitService: MeasurementUnitService,
  ) {}

  @Post()
  create(@Body() dto: CreateMeasurementUnitDto, @GetUser() user: JwtPayload) {
    return this.measurementUnitService.create(dto, user);
  }

  @Get()
  findAll(@Query('shopId') shopId: string, @GetUser() user: JwtPayload) {
    return this.measurementUnitService.findByShop(shopId, user);
  }

  @Post(':id/assign')
  assign(
    @Param('id') id: string,
    @Body() dto: AssignMeasurementUnitDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.measurementUnitService.assignToShops(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: JwtPayload) {
    return this.measurementUnitService.remove(id, user);
  }
}
