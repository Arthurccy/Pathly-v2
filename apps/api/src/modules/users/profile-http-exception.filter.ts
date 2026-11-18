import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class ProfileHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProfileHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    if (!(exception instanceof HttpException)) {
      this.logger.error('Erreur serveur non prévue sur le profil utilisateur.');
      response.status(500).json({
        success: false,
        error: { code: 'HTTP_500', message: 'Une erreur serveur est survenue.' },
      });
      return;
    }

    const status = exception.getStatus();
    const body = exception.getResponse();
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
