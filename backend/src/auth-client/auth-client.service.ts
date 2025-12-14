import { HttpModule, HttpService } from '@nestjs/axios';
import {
  ForbiddenException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import axios from 'axios';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create.dto';
import { envs } from '../config/envs';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { ResendVerificationCodeDto } from './dto/resend-verification-code.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { Disable2FADto } from './dto/disable-2fa.dto';
import { Verify2FALoginDto } from './dto/verify-2fa-login.dto';

@Injectable()
export class AuthClientService {
  private readonly baseUrl = `${envs.authServiceUrl}/auth`;
  private readonly logger = new Logger(AuthClientService.name);

  constructor(private readonly http: HttpService) {}

  private handleError(error: any, defaultMessage: string) {
    // Loguear el error completo internamente para debugging
    this.logger.error(`Error en Auth Service: ${error.message}`, error.stack);

    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response;

      // En producción, filtrar información sensible
      if (envs.nodeEnv === 'production') {
        // Solo retornar mensajes de error seguros
        const safeMessage = data?.message || defaultMessage;
        throw new HttpException({ message: safeMessage }, status);
      }

      // En desarrollo, retornar más información
      throw new HttpException(data, status);
    }

    throw new HttpException({ message: defaultMessage }, 500);
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const { data } = await this.http.axiosRef.post(
        `${this.baseUrl}/register`,
        createUserDto,
      );

      const user = this.extractUserFromResponse(data);

      // Si no hay usuario en la respuesta, devolvemos el resultado crudo
      if (!user) {
        return data;
      }

      return { ...data, user: { ...user, stripeCustomerId: user.stripeCustomerId } };
    } catch (error) {
      this.handleError(error, 'Error al registrar usuario');
    }
  }

  async login(loginUserDto: LoginDto) {
    try {
      const { data } = await this.http.axiosRef.post(
        `${this.baseUrl}/login`,
        loginUserDto,
      );

      const user = this.extractUserFromResponse(data);

      return user
        ? { ...data, user: { ...user, stripeCustomerId: user.stripeCustomerId } }
        : data;
    } catch (error) {
      this.handleError(error, 'Error al iniciar sesión');
    }
  }

  async verifyCode(verifyCodeDto: VerifyCodeDto) {
    try {
      const { data } = await this.http.axiosRef.post(
        `${this.baseUrl}/verify-code`,
        verifyCodeDto,
      );
      return data;
    } catch (error) {
      this.handleError(error, 'Error al verificar el código');
    }
  }

  async resendVerificationCode(resendDto: ResendVerificationCodeDto) {
    try {
      const { data } = await this.http.axiosRef.post(
        `${this.baseUrl}/resend-verification-code`,
        resendDto,
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        throw new HttpException(data, status);
      }
      throw new HttpException(
        { message: 'Error al reenviar el código de verificación' },
        500,
      );
    }
  }

  async getEmployeesByProject(token: string) {
    try {
      const { data } = await this.http.axiosRef.get(
        `${this.baseUrl}/get-employees/by-projects`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || { message: 'Error al obtener empleados' },
        error.response?.status || 500,
      );
    }
  }

  async createEmployee(createEmployeeDto: CreateEmployeeDto, token: string) {
    try {
      const { data } = await this.http.axiosRef.post(
        `${this.baseUrl}/employee`,
        createEmployeeDto,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data;
    } catch (error) {
      this.handleError(error, 'Error al crear empleado');
    }
  }

  async updateEmployee(
    employeeId: string,
    updateUserDto: UpdateUserDto,
    token: string,
  ) {
    try {
      const { data } = await this.http.axiosRef.patch(
        `${this.baseUrl}/employee/${employeeId}`,
        updateUserDto,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        throw new HttpException(data, status);
      }
      throw new HttpException({ message: 'Error al actualizar empleado' }, 500);
    }
  }

  async updateProfile(
    updateProfileDto: UpdateProfileDto,
    token: string,
    id: string,
  ) {
    try {
      const { data } = await this.http.axiosRef.patch(
        `${this.baseUrl}/profile/${id}`,
        updateProfileDto,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        throw new HttpException(data, status);
      }
      throw new HttpException({ message: 'Error al actualizar perfil' }, 500);
    }
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    try {
      const { data } = await this.http.axiosRef.patch(
        `${this.baseUrl}/${userId}`,
        updateUserDto,
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        throw new HttpException(data, status);
      }
      throw new HttpException({ message: 'Error al actualizar usuario' }, 500);
    }
  }

  async validateToken(token: string) {
    try {
      const { data } = await this.http.axiosRef.get(
        `${this.baseUrl}/get-user`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || { message: 'Error al validar token' },
        error.response?.status || 500,
      );
    }
  }

  // Google OAuth - Redirect URL
  getGoogleAuthUrl(): string {
    return `${this.baseUrl}/google`;
  }

  async handleGoogleCallback(code: string, state?: string) {
    try {
      const { data } = await this.http.axiosRef.get(
        `${this.baseUrl}/google/callback`,
        {
          params: { code, state },
        },
      );
      return data;
    } catch (error) {
      this.handleError(error, 'Error en autenticación con Google');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const { data } = await this.http.axiosRef.post(
        `${this.baseUrl}/forgot-password`,
        forgotPasswordDto,
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        throw new HttpException(data, status);
      }
      throw new HttpException(
        { message: 'Error al solicitar recuperación de contraseña' },
        500,
      );
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const { data } = await this.http.axiosRef.post(
        `${this.baseUrl}/reset-password`,
        resetPasswordDto,
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        throw new HttpException(data, status);
      }
      throw new HttpException(
        { message: 'Error al resetear la contraseña' },
        500,
      );
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const { data } = await this.http.axiosRef.post(
        `${this.baseUrl}/refresh`,
        refreshTokenDto,
      );
      return data;
    } catch (error) {
      this.handleError(error, 'Error al renovar el token');
    }
  }

  async enable2FA(token: string) {
    try {
      const { data } = await this.http.axiosRef.post(
        `${this.baseUrl}/2fa/enable`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data;
    } catch (error) {
      this.handleError(
        error,
        'Error al habilitar autenticación de dos factores',
      );
    }
  }

  async verify2FA(verify2FADto: Verify2FADto, token: string) {
    try {
      const { data } = await this.http.axiosRef.post(
        `${this.baseUrl}/2fa/verify`,
        verify2FADto,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data;
    } catch (error) {
      this.handleError(error, 'Error al verificar código 2FA');
    }
  }

  async disable2FA(disable2FADto: Disable2FADto, token: string) {
    try {
      const { data } = await this.http.axiosRef.post(
        `${this.baseUrl}/2fa/disable`,
        disable2FADto,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data;
    } catch (error) {
      this.handleError(
        error,
        'Error al desactivar autenticación de dos factores',
      );
    }
  }

  async verify2FALogin(verify2FALoginDto: Verify2FALoginDto) {
    try {
      const { data } = await this.http.axiosRef.post(
        `${this.baseUrl}/2fa/verify-login`,
        verify2FALoginDto,
      );
      return data;
    } catch (error) {
      this.handleError(error, 'Error al verificar código 2FA durante login');
    }
  }

  private extractUserFromResponse(response: any): any {
    if (!response) return undefined;
    // Posibles formas de respuesta: { user }, { data: { user } }, { data: { ...user } }, { ...user }
    if (response.user) return response.user;
    if (response.data?.user) return response.data.user;
    if (response.data && response.data.email) return response.data;
    if (response.email) return response;
    return undefined;
  }
}
