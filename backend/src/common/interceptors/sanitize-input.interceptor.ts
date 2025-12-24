import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import sanitizeHtml from 'sanitize-html';
import type { Request } from 'express';

@Injectable()
export class SanitizeInputInterceptor implements NestInterceptor {
  intercept<T = unknown>(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<T> {
    const request = context.switchToHttp().getRequest<Request>();

    // Sanitizar body (sí se puede reasignar)
    if (request.body && typeof request.body === 'object') {
      request.body = this.sanitizeObject(request.body);
    }

    // Sanitizar query params (NO reasignar request.query)
    if (request.query && typeof request.query === 'object') {
      const sanitized = this.sanitizeObject(request.query);
      Object.assign(request.query, sanitized); // 👈 mutación permitida
    }

    // Sanitizar params (NO reasignar request.params)
    if (request.params && typeof request.params === 'object') {
      const sanitized = this.sanitizeObject(request.params);
      Object.assign(request.params, sanitized); // 👈 mutación permitida
    }

    return next.handle();
  }

  private sanitizeObject<T>(obj: T): T {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item)) as unknown as T;
    }

    if (typeof obj === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = (obj as Record<string, unknown>)[key];
          sanitized[key] = this.sanitizeObject(value);
        }
      }
      return sanitized as unknown as T;
    }

    if (typeof obj === 'string') {
      return sanitizeHtml(obj, {
        allowedTags: [],
        allowedAttributes: {},
        disallowedTagsMode: 'recursiveEscape',
      }) as unknown as T;
    }

    return obj;
  }
}
