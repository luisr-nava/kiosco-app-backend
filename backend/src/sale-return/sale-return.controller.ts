import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { SaleReturnService } from './sale-return.service';
import { CreateSaleReturnDto } from './dto/create-sale-return.dto';
import { UpdateSaleReturnDto } from './dto/update-sale-return.dto';
import { JwtAuthGuard } from '../auth-client/guards/jwt-auth.guard';
import { GetUser } from '../auth-client/decorators/get-user.decorator';
import { CommonQueryWithDatesDto } from '../common/dto';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';
import { SaleReturnStatus } from '@prisma/client';

@Controller('sale-return')
export class SaleReturnController {
  constructor(private readonly saleReturnService: SaleReturnService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createSaleReturnDto: CreateSaleReturnDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.saleReturnService.create(createSaleReturnDto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @GetUser() user: JwtPayload,
    @Query() query: CommonQueryWithDatesDto,
    @Query('shopId') shopId?: string,
    @Query('status') status?: string,
  ) {
    const parsedStatus =
      status &&
      Object.values(SaleReturnStatus).includes(status as SaleReturnStatus)
        ? (status as SaleReturnStatus)
        : undefined;

    return this.saleReturnService.findAll(user, {
      ...query,
      shopId,
      status: parsedStatus,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @GetUser() user: JwtPayload) {
    return this.saleReturnService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateSaleReturnDto: UpdateSaleReturnDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.saleReturnService.update(id, updateSaleReturnDto, user);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard)
  approve(@Param('id') id: string, @GetUser() user: JwtPayload) {
    return this.saleReturnService.approve(id, user);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard)
  reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @GetUser() user: JwtPayload,
  ) {
    return this.saleReturnService.reject(id, reason, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @GetUser() user: JwtPayload) {
    return this.saleReturnService.remove(id, user);
  }
}
