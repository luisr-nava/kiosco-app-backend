import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { envs } from '../../config/envs';

@Injectable()
export class CustomLoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor() {
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json(),
    );

    const transports: winston.transport[] = [
      // Console output (solo en desarrollo)
      new winston.transports.Console({
        level: 'error',
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(
            ({ timestamp, level, message, context, trace, ...meta }) => {
              const metaStr = Object.keys(meta).length
                ? JSON.stringify(meta, null, 2)
                : '';
              return `${timestamp} [${context || 'App'}] ${level}: ${message} ${metaStr} ${trace || ''}`;
            },
          ),
        ),
      }),
    ];

    // Archivo de logs diarios (producción y desarrollo)
    if (envs.nodeEnv === 'production') {
      transports.push(
        // Logs de error
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: '20m',
          maxFiles: '14d',
          format: logFormat,
        }),
        // Todos los logs
        new DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          format: logFormat,
        }),
        // Logs de seguridad
        new DailyRotateFile({
          filename: 'logs/security-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'warn',
          maxSize: '20m',
          maxFiles: '30d',
          format: logFormat,
        }),
      );
    }

    this.logger = winston.createLogger({
      level: 'error', // Solo errores
      format: logFormat,
      transports,
    });
  }

  log(message: string, context?: string, meta?: Record<string, unknown>) {
    // Silenciado
  }

  error(
    message: string,
    trace?: string,
    context?: string,
    meta?: Record<string, unknown>,
  ) {
    const metadata = meta ?? {};
    this.logger.error(message, { context, trace, ...metadata });
  }

  warn(message: string, context?: string) {
    // Silenciado
  }

  debug(message: string, context?: string) {
    // Silenciado
  }

  verbose(message: string, context?: string) {
    // Silenciado
  }

  // Método específico para eventos de seguridad
  security(
    event: string,
    details: Record<string, unknown>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
  ) {
    // Silenciado para evitar logs no deseados
  }

  // Método para auditoría de acciones sensibles
  audit(action: string, userId: string, details: Record<string, unknown>) {
    // Silenciado para evitar logs no deseados
  }
}
