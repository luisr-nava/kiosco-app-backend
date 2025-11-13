import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthClientService } from './auth-client.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create.dto';
import { GetUser } from './decorators/get-user.decorator';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ShopService } from '../shop/shop.service';
import { Shop } from '@prisma/client';

@Controller('auth-client')
export class AuthClientController {
  constructor(
    private readonly authClientService: AuthClientService,
    private readonly shopsService: ShopService,
  ) {}
  @Post('login')
  async login(@Body() loginUserDto: LoginDto) {
    return this.authClientService.login(loginUserDto);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authClientService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('employee')
  async getAllEmployee(@GetUser() user: JwtPayload) {
    return this.authClientService.getEmployeesByProject(user.projectId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getUser(@Req() req, @GetUser() user: JwtPayload) {
    const token = req.headers.authorization.split(' ')[1];
    const userData = await this.authClientService.validateToken(token);
    const shops = await this.shopsService.getMyShops(user);

    const minimalShops = (shops as Shop[]).map((shop) => ({
      id: shop.id,
      name: shop.name,
    }));

    return {
      user: userData,
      shops: minimalShops,
    };
  }
}
//  TODO: Create EP update
