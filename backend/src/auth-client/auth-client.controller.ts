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
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create.dto';
import { LogoutDto } from './dto/logout.dto';
import { GetUser } from './decorators/get-user.decorator';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ShopService } from '../shop/shop.service';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { ResendVerificationCodeDto } from './dto/resend-verification-code.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { FailedAttemptsGuard } from '../common/guards/failed-attempts.guard';
import { CustomLoggerService } from '../common/logger/logger.service';
import { CashRegisterService } from '../cash-register/cash-register.service';

@Controller('auth-client')
export class AuthClientController {
  constructor(
    private readonly authClientService: AuthClientService,
    private readonly shopsService: ShopService,
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly failedAttemptsGuard: FailedAttemptsGuard,
    private readonly logger: CustomLoggerService,
    private readonly cashRegisterService: CashRegisterService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authClientService.create(createUserDto);
  }

  @UseGuards(FailedAttemptsGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginDto, @Req() req) {
    try {
      const result = await this.authClientService.login(loginUserDto);

      // Login exitoso, limpiar intentos fallidos
      const identifier = loginUserDto.email || req.ip;
      this.failedAttemptsGuard.recordSuccessfulAttempt(identifier);

      this.logger.audit('User login', loginUserDto.email, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });

      // Adjuntar info de cajas abiertas para las tiendas del usuario
      const user = result?.user;
      if (user?.id && user?.role && user?.projectId) {
        const jwtPayload: JwtPayload = {
          id: user.id,
          role: user.role,
          projectId: user.projectId,
          email: user.email,
        };

        const shopsResponse = await this.shopsService.getMyShops(jwtPayload);
        const shops = shopsResponse.data ?? [];
        const shopIds = shops.map((shop) => shop.id);

        const openCashRegisters =
          await this.cashRegisterService.findOpenCashRegistersForShops(
            shopIds,
            jwtPayload,
          );
        const hasOpenCashRegister = openCashRegisters.some((item) =>
          item.cashRegisters.some(
            (register) => register.employeeId === jwtPayload.id,
          ),
        );

        const minimalShops = shops.map((shop) => ({
          id: shop.id,
          name: shop.name,
        }));

        return {
          ...result,
          shops: minimalShops,
          openCashRegisters,
          hasOpenCashRegister,
        };
      }

      return result;
    } catch (error) {
      // Login fallido, registrar intento
      const identifier = loginUserDto.email || req.ip;
      this.failedAttemptsGuard.recordFailedAttempt(identifier);

      this.logger.security('Failed login attempt', {
        email: loginUserDto.email,
        ip: req.ip,
        severity: 'medium',
      });

      throw error;
    }
  }

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

  @Post('verify-code')
  @HttpCode(HttpStatus.OK)
  async verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    return this.authClientService.verifyCode(verifyCodeDto);
  }

  @Post('resend-verification-code')
  @HttpCode(HttpStatus.OK)
  async resendVerificationCode(@Body() resendDto: ResendVerificationCodeDto) {
    return this.authClientService.resendVerificationCode(resendDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('employee')
  async createEmployee(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @Req() req,
  ) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Token de autorización no proporcionado');
    }
    const token = authHeader.split(' ')[1];
    return this.authClientService.createEmployee(createEmployeeDto, token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getUser(@Req() req, @GetUser() user: JwtPayload) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Token de autorización no proporcionado');
    }
    const token = authHeader.split(' ')[1];
    const userData = await this.authClientService.validateToken(token);
    const shopsResponse = await this.shopsService.getMyShops(user);

    const minimalShops = shopsResponse.data.map((shop) => ({
      id: shop.id,
      name: shop.name,
    }));

    return {
      user: userData,
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

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authClientService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authClientService.resetPassword(resetPasswordDto);
  }
}
