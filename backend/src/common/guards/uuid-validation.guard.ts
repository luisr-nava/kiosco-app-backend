import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isValidUUID = (value: string): boolean => UUID_REGEX.test(value);

/**
 * Guard que valida que los parámetros UUID sean válidos
 * Previene inyecciones y errores de base de datos
 */
@Injectable()
export class UuidValidationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const params = request.params;

    if (!params || typeof params !== 'object') {
      return true;
    }

    // Validar todos los parámetros que terminen en 'Id' o sean 'id'
    for (const [key, value] of Object.entries(params)) {
      if ((key.endsWith('Id') || key === 'id') && typeof value === 'string') {
        if (!isValidUUID(value)) {
          throw new BadRequestException(
            `El parámetro '${key}' debe ser un UUID válido`,
          );
        }
      }
    }

    return true;
  }
}
