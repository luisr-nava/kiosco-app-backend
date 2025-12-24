import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { JwtAuthGuard } from '../auth-client/guards/jwt-auth.guard';
import { GetUser } from '../auth-client/decorators/get-user.decorator';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopsService: ShopService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createShop(
    @GetUser() user: JwtPayload,
    @Body() createShopDto: CreateShopDto,
  ) {
    return this.shopsService.createShop(user, createShopDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-shops')
  async getMyShops(@GetUser() user: JwtPayload) {
    return this.shopsService.getMyShops(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getShopById(@Param('id') id: string, @GetUser() user: JwtPayload) {
    return this.shopsService.getShopById(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateShop(
    @Param('id') id: string,
    @Body() updateShopDto: UpdateShopDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.shopsService.updateShop(id, updateShopDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/toggle')
  toggleShop(@Param('id') id: string, @GetUser() user: JwtPayload) {
    return this.shopsService.toggleShop(id, user);
  }
}
