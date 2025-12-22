import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { envs } from '../config/envs';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

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
}
