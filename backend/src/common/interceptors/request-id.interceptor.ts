import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { CustomLoggerService } from '../logger/logger.service';
import type { Request, Response } from 'express';

type RequestWithId = Request & { requestId?: string };

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLoggerService) {}

  intercept<T = unknown>(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<T> {
    const request = context.switchToHttp().getRequest<RequestWithId>();
    const response = context.switchToHttp().getResponse<Response>();

    // Generar o usar request ID existente
    const headerRequestId = request.headers['x-request-id'];
    const requestId =
      typeof headerRequestId === 'string'
        ? headerRequestId
        : Array.isArray(headerRequestId) && headerRequestId.length > 0
          ? headerRequestId[0]
          : uuidv4();
    request.requestId = requestId;
    response.setHeader('X-Request-ID', requestId);

    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    this.logger.log(`Incoming Request: ${method} ${url}`, 'HTTP', {
      requestId,
      ip,
      userAgent,
    });

    return next.handle().pipe(
      tap({
        next: () => {
          const { statusCode } = response;
          const contentLength = response.get('content-length');
          const duration = Date.now() - startTime;

          this.logger.log(
            `Outgoing Response: ${method} ${url} ${statusCode} - ${duration}ms`,
            'HTTP',
            {
              requestId,
              statusCode,
              contentLength,
              duration,
            },
          );
        },
        error: (error: unknown) => {
          const duration = Date.now() - startTime;
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          const errorStack = error instanceof Error ? error.stack : undefined;
          const errorName = error instanceof Error ? error.name : 'Error';

          this.logger.error(
            `Request Error: ${method} ${url} - ${errorMessage}`,
            errorStack,
            'HTTP',
            {
              requestId,
              duration,
              errorName,
            },
          );
        },
      }),
    );
  }
}
