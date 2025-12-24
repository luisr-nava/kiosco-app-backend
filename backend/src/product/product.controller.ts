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

import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetUser } from '../auth-client/decorators/get-user.decorator';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';
import { JwtAuthGuard } from '../auth-client/guards/jwt-auth.guard';
import { SearchQueryWithShopDto } from '../common/dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.productService.createProduct(createProductDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.productService.updateProduct(id, updateProductDto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@GetUser() user: JwtPayload, @Query() query: SearchQueryWithShopDto) {
    return this.productService.getAllProducts(user, query);
  }

  @Patch('toggle/:id')
  @UseGuards(JwtAuthGuard)
  toggleProduct(@Param('id') id: string, @GetUser() user: JwtPayload) {
    return this.productService.toggleActiveProduct(id, user);
  }

  @Get('barcode/:barcode')
  @UseGuards(JwtAuthGuard)
  async getByBarcode(
    @Param('barcode') barcode: string,
    @Query('shopId') shopId: string,
    @GetUser() user: JwtPayload,
  ) {
    return this.productService.getProductByBarcode(barcode, user, shopId);
  }
}
