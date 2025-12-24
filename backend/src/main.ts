import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { envs } from './config/envs';
import helmet from 'helmet';
import { CustomLoggerService } from './common/logger/logger.service';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';
import { SanitizeInputInterceptor } from './common/interceptors/sanitize-input.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['error'] });

  // Seguridad: Headers HTTP con Helmet (configuración mejorada)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 año
        includeSubDomains: true,
        preload: true,
      },
      frameguard: {
        action: 'deny', // Previene clickjacking
      },
      hidePoweredBy: true, // Oculta X-Powered-By header
      noSniff: true, // Previene MIME sniffing
      xssFilter: true, // XSS protection
    }),
  );

  // Sanitización de inputs para prevenir XSS
  app.useGlobalInterceptors(new SanitizeInputInterceptor());

  app.setGlobalPrefix('api');

  // CORS dinámico: '*' en desarrollo, lista específica en producción
  const corsOrigin =
    envs.nodeEnv === 'development'
      ? '*'
      : envs.allowedOrigins.split(',').map((origin) => origin.trim());

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // ❌ elimina propiedades que no están en el DTO
      forbidNonWhitelisted: true, // ❌ lanza error si envían algo que no está en el DTO
      transform: true, // ✅ transforma payloads a instancias de DTOs
    }),
  );

  await app.listen(envs.port);
  // Único log informativo: app arriba

  console.log(`🚀 Servidor ejecutándose en http://localhost:${envs.port}`);
}
bootstrap();
