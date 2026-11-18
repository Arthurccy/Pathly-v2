import { INestApplication, ValidationPipe } from '@nestjs/common';

export const DEFAULT_API_PREFIX = 'api/v1';

/**
 * Configuration HTTP partagée entre main.ts et les tests d'API,
 * pour que les tests exercent la même validation et le même préfixe.
 */
export function configureHttp(app: INestApplication, prefix = process.env.API_PREFIX || DEFAULT_API_PREFIX): string {
  // Validation stricte des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix(prefix);
  return prefix;
}
