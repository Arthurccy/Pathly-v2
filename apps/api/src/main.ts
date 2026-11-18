import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { configureHttp } from './app.setup';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Sécurité HTTP niveau bancaire
  app.use(helmet());

  // CORS sécurisé avec origine stricte
  const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
  app.enableCors({
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Validation stricte des DTOs et préfixe global des routes (partagés avec les tests)
  const globalPrefix = configureHttp(app);

  // Documentation Swagger OpenAPI pour l'équipe (Séance 2 & 3)
  const config = new DocumentBuilder()
    .setTitle('Pathly V2 Banking API')
    .setDescription('API FinTech sécurisée - Ingestion bancaire Powens & Calculs de trésorerie')
    .setVersion('2.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`🚀 Pathly API démarrée sur http://localhost:${port}/${globalPrefix}`);
  logger.log(`📚 Documentation Swagger : http://localhost:${port}/docs`);
}

bootstrap();
