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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
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

@ApiTags('Autenticación')
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
  @ApiOperation({
    summary: 'Registrar nuevo usuario OWNER',
    description:
      'Crea un nuevo usuario con rol OWNER y envía código de verificación',
  })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiBody({ type: CreateUserDto })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authClientService.create(createUserDto);
  }

  @UseGuards(FailedAttemptsGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Autentica un usuario verificado y devuelve un token JWT con projectId. Bloqueado tras 5 intentos fallidos.',
  })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas o cuenta no verificada',
  })
  @ApiResponse({
    status: 429,
    description: 'Demasiados intentos fallidos. Cuenta bloqueada temporalmente',
  })
  @ApiBody({ type: LoginDto })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Cerrar sesión',
    description: 'Invalida el token JWT actual agregándolo a la blacklist',
  })
  @ApiResponse({ status: 200, description: 'Logout exitoso' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiBody({ type: LogoutDto })
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
  @ApiOperation({
    summary: 'Verificar código de email',
    description: 'Verifica la cuenta del usuario con código de 6 dígitos',
  })
  @ApiResponse({ status: 200, description: 'Cuenta verificada correctamente' })
  @ApiResponse({ status: 400, description: 'Código inválido o expirado' })
  @ApiBody({ type: VerifyCodeDto })
  async verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    return this.authClientService.verifyCode(verifyCodeDto);
  }

  @Post('resend-verification-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reenviar código de verificación',
    description: 'Envía un nuevo código de verificación al email del usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'Código de verificación reenviado',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiBody({ type: ResendVerificationCodeDto })
  async resendVerificationCode(@Body() resendDto: ResendVerificationCodeDto) {
    return this.authClientService.resendVerificationCode(resendDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('employee')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Crear empleado (solo OWNER)',
    description:
      'Crea un nuevo empleado que hereda el projectId del OWNER autenticado',
  })
  @ApiResponse({ status: 201, description: 'Empleado creado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Solo OWNER puede crear empleados' })
  @ApiBody({ type: CreateEmployeeDto })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener información del usuario actual',
    description:
      'Devuelve la información del usuario autenticado y sus tiendas',
  })
  @ApiResponse({ status: 200, description: 'Información del usuario obtenida' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener empleados del proyecto',
    description: 'Lista todos los empleados del proyecto actual',
  })
  @ApiResponse({ status: 200, description: 'Lista de empleados obtenida' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar perfil propio',
    description: 'Permite al usuario actualizar su propia información',
  })
  @ApiResponse({ status: 200, description: 'Perfil actualizado correctamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiBody({ type: UpdateProfileDto })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar empleado (solo OWNER)',
    description: 'Permite al OWNER actualizar la información de un empleado',
  })
  @ApiResponse({
    status: 200,
    description: 'Empleado actualizado correctamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Solo OWNER puede actualizar empleados',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del empleado a actualizar',
    type: String,
  })
  @ApiBody({ type: UpdateUserDto })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar usuario (requiere autenticación)',
    description: 'Actualiza la información de un usuario específico',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado correctamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario a actualizar',
    type: String,
  })
  @ApiBody({ type: UpdateUserDto })
  async updateUser(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.authClientService.updateUser(userId, updateUserDto);
  }

  @Get('google')
  @ApiOperation({
    summary: 'Autenticación con Google OAuth',
    description:
      'Redirige al usuario al flujo de autenticación de Google en el auth-service',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirige a Google para autenticación',
  })
  async googleAuth(@Res() res: Response) {
    const googleAuthUrl = this.authClientService.getGoogleAuthUrl();
    return res.redirect(googleAuthUrl);
  }

  @Get('google/callback')
  @ApiOperation({
    summary: 'Callback de Google OAuth',
    description:
      'Procesa el callback de Google y devuelve el token JWT del usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'Autenticación exitosa, retorna token y usuario',
  })
  @ApiResponse({
    status: 400,
    description: 'Error en autenticación con Google',
  })
  @ApiQuery({
    name: 'code',
    description: 'Código de autorización de Google',
    required: true,
  })
  @ApiQuery({
    name: 'state',
    description: 'Estado opcional para CSRF protection',
    required: false,
  })
  async googleAuthCallback(
    @Query('code') code: string,
    @Query('state') state?: string,
  ) {
    return this.authClientService.handleGoogleCallback(code, state);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar recuperación de contraseña',
    description:
      'Envía un email con un link para resetear la contraseña del usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'Email de recuperación enviado correctamente',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authClientService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resetear contraseña',
    description:
      'Establece una nueva contraseña usando el token enviado por email',
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada correctamente',
  })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authClientService.resetPassword(resetPasswordDto);
  }

  //! TODO:  solicitar explicacion
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Renovar token de acceso',
    description:
      'Utiliza un refresh token para obtener un nuevo access token. El refresh token anterior será revocado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token renovado exitosamente',
    schema: {
      example: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'nuevo-refresh-token...',
        user: {
          id: 'uuid',
          fullName: 'Juan Pérez',
          email: 'juan@example.com',
          role: 'OWNER',
          projectId: 'uuid',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido o expirado',
  })
  @ApiBody({ type: RefreshTokenDto })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authClientService.refreshToken(refreshTokenDto);
  }

  //! TODO:  solicitar explicacion
  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Habilitar autenticación de dos factores (2FA)',
    description:
      'Genera un código QR y códigos de recuperación para configurar 2FA. El usuario debe escanear el QR con una app de autenticación (Google Authenticator, Authy, etc.) y verificar con un código.',
  })
  @ApiResponse({
    status: 201,
    description: '2FA habilitado. Retorna QR code, secret y recovery codes',
    schema: {
      example: {
        secret: 'JBSWY3DPEHPK3PXP',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
        recoveryCodes: [
          'A1B2C3D4',
          'E5F6G7H8',
          'I9J0K1L2',
          'M3N4O5P6',
          'Q7R8S9T0',
          'U1V2W3X4',
          'Y5Z6A7B8',
          'C9D0E1F2',
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Verificar configuración de 2FA',
    description:
      'Verifica el código generado por la app de autenticación para confirmar que 2FA está correctamente configurado.',
  })
  @ApiResponse({
    status: 200,
    description: '2FA verificado y activado correctamente',
  })
  @ApiResponse({ status: 400, description: 'Código inválido' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiBody({ type: Verify2FADto })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Desactivar autenticación de dos factores',
    description:
      'Desactiva 2FA para el usuario. Requiere código de verificación para confirmar.',
  })
  @ApiResponse({
    status: 200,
    description: '2FA desactivado correctamente',
  })
  @ApiResponse({ status: 400, description: 'Código inválido' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiBody({ type: Disable2FADto })
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
  @ApiOperation({
    summary: 'Completar login con 2FA',
    description:
      'Completa el proceso de login cuando el usuario tiene 2FA habilitado. Requiere el token temporal del login y el código 2FA.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login con 2FA exitoso',
    schema: {
      example: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'refresh-token...',
        user: {
          id: 'uuid',
          fullName: 'Juan Pérez',
          email: 'juan@example.com',
          role: 'OWNER',
          projectId: 'uuid',
        },
        projectId: 'uuid',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Código inválido o token temporal expirado',
  })
  @ApiBody({ type: Verify2FALoginDto })
  async verify2FALogin(@Body() verify2FALoginDto: Verify2FALoginDto) {
    return this.authClientService.verify2FALogin(verify2FALoginDto);
  }
}
