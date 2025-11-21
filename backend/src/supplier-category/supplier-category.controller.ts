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
import { SupplierCategoryService } from './supplier-category.service';
import { CreateSupplierCategoryDto } from './dtos/create-supplier-category.dto';
import { UpdateSupplierCategoryDto } from './dtos/update-supplier-category.dto';
import { GetUser } from '../auth-client/decorators/get-user.decorator';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';
import { JwtAuthGuard } from '../auth-client/guards/jwt-auth.guard';
import { SearchQueryWithInactiveDto } from '../common/dto';

@Controller('supplier-category')
export class SupplierCategoryController {
  constructor(
    private readonly supplierCategoryService: SupplierCategoryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createSupplierCategoryDto: CreateSupplierCategoryDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.supplierCategoryService.create(createSupplierCategoryDto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @GetUser() user: JwtPayload,
    @Query() query: SearchQueryWithInactiveDto,
  ) {
    return this.supplierCategoryService.findAll(user, query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @GetUser() user: JwtPayload) {
    return this.supplierCategoryService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateSupplierCategoryDto: UpdateSupplierCategoryDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.supplierCategoryService.update(
      id,
      updateSupplierCategoryDto,
      user,
    );
  }

  @Patch('toggle/:id')
  @UseGuards(JwtAuthGuard)
  toggleActive(@Param('id') id: string, @GetUser() user: JwtPayload) {
    return this.supplierCategoryService.toggleActive(id, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @GetUser() user: JwtPayload) {
    return this.supplierCategoryService.remove(id, user);
  }
}
