import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch(HttpException)
export class ProfileHttpExceptionFilter implements ExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const status = exception.getStatus();
    const body = exception.getResponse();
    const response = host.switchToHttp().getResponse<Response>();
    if (typeof body === 'object' && 'success' in body && body.success === false && 'error' in body) {
      response.status(status).json(body);
      return;
    }

    const message = typeof body === 'string'
      ? body
      : 'message' in body && Array.isArray(body.message)
        ? body.message.join(', ')
        : 'message' in body && typeof body.message === 'string'
          ? body.message
          : exception.message;
    response.status(status).json({
      success: false,
      error: { code: `HTTP_${status}`, message },
    });
  }
}
