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
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { DeletePurchaseDto } from './dto/delete-purchase.dto';
import { PurchaseQueryDto } from './dto/purchase-query.dto';
import { DeletionHistoryQueryDto } from './dto/deletion-history-query.dto';
import { GetUser } from '../auth-client/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth-client/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';

@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createPurchaseDto: CreatePurchaseDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.purchaseService.createPurchase(createPurchaseDto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@GetUser() user: JwtPayload, @Query() query: PurchaseQueryDto) {
    return this.purchaseService.findAll(user, query);
  }

  @Get('deletion-history')
  @UseGuards(JwtAuthGuard)
  getDeletionHistory(
    @GetUser() user: JwtPayload,
    @Query() query: DeletionHistoryQueryDto,
  ) {
    return this.purchaseService.getDeletionHistory(user, query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @GetUser() user: JwtPayload) {
    return this.purchaseService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updatePurchaseDto: UpdatePurchaseDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.purchaseService.update(id, updatePurchaseDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id') id: string,
    @Body() deletePurchaseDto: DeletePurchaseDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.purchaseService.remove(id, deletePurchaseDto, user);
  }
}
