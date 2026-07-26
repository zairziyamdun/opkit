import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SocketIoRedisAdapterService } from './events/adapters/socket-io-redis-adapter.service';
import { SocketIoAdapter } from './events/adapters/socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const redisAdapterService = app.get(SocketIoRedisAdapterService);
  const frontendUrl = configService.getOrThrow<string>('FRONTEND_URL');

  app.enableShutdownHooks();
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  await redisAdapterService.initialize();
  app.useWebSocketAdapter(
    new SocketIoAdapter(app, frontendUrl, redisAdapterService),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Opkit API')
    .setDescription('Opkit backend API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(configService.getOrThrow<number>('PORT'));
}

void bootstrap();
