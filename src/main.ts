import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('START');
  const port = configService.get('port');

  createSwagger(app);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );

  await app.listen(port, () => {
    logger.debug(`---------- Server started on port ${port} ----------`);
  });
}
async function createSwagger(app: INestApplication) {
  const TITLE = 'ServerAPI';
  const configSW = new DocumentBuilder()
    .setTitle(TITLE)
    .setDescription('My server configurato backend')
    .setVersion(process.env.npm_package_version || '0.1.0')
    .build();
  const documentOptions: SwaggerDocumentOptions = {
    ignoreGlobalPrefix: true,
    // deepScanRoutes: true,
  };
  const customOptions: SwaggerCustomOptions = {
    customfavIcon: 'https://nestjs.com/img/logo_text.svg',
    customSiteTitle: TITLE,
  };

  const document = SwaggerModule.createDocument(app, configSW, documentOptions);
  SwaggerModule.setup('api', app, document, customOptions);
}
bootstrap();
