import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthClientService } from './auth-client.service';
import { LogoutDto } from './dto/logout.dto';
import { GetUser } from './decorators/get-user.decorator';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ShopService } from '../shop/shop.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { CustomLoggerService } from '../common/logger/logger.service';

@Controller('auth-client')
export class AuthClientController {
  constructor(
    private readonly authClientService: AuthClientService,
    private readonly shopsService: ShopService,
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly logger: CustomLoggerService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @GetUser() user: JwtPayload,
    @Req() req,
    @Body() logoutDto: LogoutDto,
  ) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Token de autorización no proporcionado');
    }

    const token = authHeader.split(' ')[1];
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    this.tokenBlacklistService.blacklistToken(
      token,
      expiresAt,
      user.id,
      logoutDto.reason || 'User logout',
    );

    this.logger.audit('User logout', user.id, {
      email: user.email,
      reason: logoutDto.reason,
    });

    return {
      message: 'Logout exitoso. Token invalidado.',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getUser(@GetUser() user: JwtPayload) {
    const shopsResponse = await this.shopsService.getMyShops(user);

    const minimalShops = (shopsResponse.data ?? []).map((shop) => ({
      id: shop.id,
      name: shop.name,
    }));

    return {
      user,
      shops: minimalShops,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('employees')
  async getAllEmployees(@Req() req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Token de autorización no proporcionado');
    }
    const token = authHeader.split(' ')[1];
    return this.authClientService.getEmployeesByProject(token);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/:id')
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @Req() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Token de autorización no proporcionado');
    }
    const token = authHeader.split(' ')[1];
    return this.authClientService.updateProfile(updateProfileDto, token, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('employee/:id')
  async updateEmployee(
    @Param('id', ParseUUIDPipe) employeeId: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
  ) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Token de autorización no proporcionado');
    }
    const token = authHeader.split(' ')[1];
    return this.authClientService.updateEmployee(
      employeeId,
      updateUserDto,
      token,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateUser(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.authClientService.updateUser(userId, updateUserDto);
  }
}
