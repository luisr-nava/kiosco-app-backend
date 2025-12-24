import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware que agrega headers de seguridad adicionales
 * y previene técnicas de bypass
 */
@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Prevenir MIME sniffing adicional
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Prevenir clickjacking adicional
    res.setHeader('X-Frame-Options', 'DENY');

    // Habilitar XSS protection en navegadores antiguos
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Política de referrer restrictiva
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Prevenir que el navegador guarde datos sensibles
    res.setHeader(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, private',
    );
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Permissions Policy (antes Feature Policy)
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
    );

    // Validar que no haya headers sospechosos
    this.validateSuspiciousHeaders(req);

    next();
  }

  private validateSuspiciousHeaders(req: Request) {
    // Detectar intentos de bypass de rate limiting
    const suspiciousHeaders = [
      'x-forwarded-for',
      'x-real-ip',
      'x-client-ip',
      'x-forwarded',
      'forwarded-for',
      'forwarded',
      'via',
      'x-originating-ip',
    ];

    // Registrar si hay múltiples IPs (posible intento de bypass)
    for (const header of suspiciousHeaders) {
      const value = req.headers[header];
      if (value && typeof value === 'string' && value.split(',').length > 3) {
        // Potencial intento de bypass - podríamos registrar o bloquear
        // Por ahora solo normalizamos tomando la primera IP
        req.headers[header] = value.split(',')[0].trim();
      }
    }
  }
}
