import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const logger = new Logger('MainLogger');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  const allowedOrigins =
    process.env.CORS_ORIGIN?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) || [];

  logger.log(`Allowed CORS origins: ${JSON.stringify(allowedOrigins)}`);

  app.enableCors({
    origin: (origin, callback) => {
      logger.log(`CORS request from origin: ${origin || 'NO ORIGIN'}`);

      // Permitir peticiones sin origin (como Postman, curl, etc.)
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.includes(origin);

      if (isAllowed) {
        return callback(null, true);
      }

      logger.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    exposedHeaders: ['Content-Length', 'X-Request-Id'],
    credentials: true,
    maxAge: 86400, // 24 horas en segundos
    optionsSuccessStatus: 204,
    preflightContinue: false,
  });

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
      hsts:
        process.env.NODE_ENV === 'production'
          ? {
              maxAge: 31536000,
              includeSubDomains: true,
              preload: true,
            }
          : false,
      frameguard: { action: 'deny' },
      noSniff: true,
    }),
  );

  app.use(bodyParser.json({ limit: '1mb' }));

  if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
      logger.log(
        `${req.method} ${req.originalUrl} | origin=${req.headers.origin || 'NO_ORIGIN'} | host=${req.headers.host}`,
      );
      next();
    });
  }

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      forbidUnknownValues: true,
    }),
  );

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Magnolias API')
      .setDescription('API documentation for the Magnolias application')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          in: 'header',
        },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const PORT = process.env.PORT ?? 3000;

  await app.listen(PORT);

  logger.log(`Application is running on port ${PORT}`);
}
bootstrap();
