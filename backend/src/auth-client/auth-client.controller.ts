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
  Query,
  Redirect,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';

import type { Response } from 'express';
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
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { Disable2FADto } from './dto/disable-2fa.dto';
import { Verify2FALoginDto } from './dto/verify-2fa-login.dto';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { FailedAttemptsGuard } from '../common/guards/failed-attempts.guard';
import { CustomLoggerService } from '../common/logger/logger.service';
import { ExtractJwt } from 'passport-jwt';

@Controller('auth-client')
export class AuthClientController {
  constructor(
    private readonly authClientService: AuthClientService,
    private readonly shopsService: ShopService,
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly failedAttemptsGuard: FailedAttemptsGuard,
    private readonly logger: CustomLoggerService,
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

  @Get('google')
  async googleAuth(@Res() res: Response) {
    const googleAuthUrl = this.authClientService.getGoogleAuthUrl();
    return res.redirect(googleAuthUrl);
  }

  @Get('google/callback')
  async googleAuthCallback(
    @Query('code') code: string,
    @Query('state') state?: string,
  ) {
    return this.authClientService.handleGoogleCallback(code, state);
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

  //! TODO:  solicitar explicacion
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authClientService.refreshToken(refreshTokenDto);
  }

  //! TODO:  solicitar explicacion
  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  async enable2FA(@Req() req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Token de autorización no proporcionado');
    }
    const token = authHeader.split(' ')[1];
    return this.authClientService.enable2FA(token);
  }

  //! TODO:  solicitar explicacion

  @UseGuards(JwtAuthGuard)
  @Post('2fa/verify')
  async verify2FA(@Body() verify2FADto: Verify2FADto, @Req() req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Token de autorización no proporcionado');
    }
    const token = authHeader.split(' ')[1];
    return this.authClientService.verify2FA(verify2FADto, token);
  }

  //! TODO:  solicitar explicacion
  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  async disable2FA(@Body() disable2FADto: Disable2FADto, @Req() req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Token de autorización no proporcionado');
    }
    const token = authHeader.split(' ')[1];
    return this.authClientService.disable2FA(disable2FADto, token);
  }

  //! TODO:  solicitar explicacion
  @Post('2fa/verify-login')
  @HttpCode(HttpStatus.OK)
  async verify2FALogin(@Body() verify2FALoginDto: Verify2FALoginDto) {
    return this.authClientService.verify2FALogin(verify2FALoginDto);
  }
}
