import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';
import { GetUser } from '../auth-client/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth-client/guards/jwt-auth.guard';
import { SearchQueryWithShopAndInactiveDto } from '../common/dto';

@Controller('supplier')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createSupplierDto: CreateSupplierDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.supplierService.createSupplier(createSupplierDto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @GetUser() user: JwtPayload,
    @Query() query: SearchQueryWithShopAndInactiveDto,
  ) {
    return this.supplierService.getSuppliers(user, query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @GetUser() user: JwtPayload) {
    return this.supplierService.getSupplierById(id, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.supplierService.updateSupplier(id, updateSupplierDto, user);
  }

  @Patch('toggle/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @GetUser() user: JwtPayload) {
    return this.supplierService.toggleActiveSupplier(id, user);
  }
}
