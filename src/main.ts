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

  // CORS debe ir ANTES de helmet y otros middlewares
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(origin => origin.trim()) || [];

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origin (como Postman, curl, etc.)
      if (!origin) return callback(null, true);

      // Verificar si el origin está en la lista permitida
      if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Request-Id'],
    credentials: true,
    maxAge: 86400, // 24 horas en segundos
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  // Redirección HTTPS solo después de CORS
  if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
      // No redirigir peticiones OPTIONS (preflight)
      if (req.method === 'OPTIONS') {
        return next();
      }
      if (req.header('x-forwarded-proto') !== 'https') {
        res.redirect(`https://${req.header('host')}${req.url}`);
      } else {
        next();
      }
    });
  }

  app.use(
    helmet({
      contentSecurityPolicy: false, // Desactivar CSP ya que puede interferir
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      frameguard: { action: 'deny' },
      noSniff: true,
    }),
  );

  app.use(bodyParser.json({ limit: '1mb' }));

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
