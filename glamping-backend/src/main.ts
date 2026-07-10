import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { DeviceGuard } from './common/guards/device.guard';
import { PrismaService } from './common/prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(helmet());
  const allowedOrigins = config.get('FRONTEND_URL', '*');
  app.enableCors({
    origin: allowedOrigins === '*' ? '*' : allowedOrigins.split(',').map((s: string) => s.trim()),
    credentials: true,
  });

  const reflector = app.get(Reflector);
  const prisma = app.get(PrismaService);
  app.useGlobalGuards(new JwtAuthGuard(reflector), new DeviceGuard(prisma));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor(), new LoggingInterceptor());

  app.setGlobalPrefix('api');

  const documentConfig = new DocumentBuilder()
    .setTitle('Glamping API')
    .setDescription('API for glamping management system')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup('api/docs', app, document);

  app.enableShutdownHooks();

  const port = config.get('PORT', 3000);
  await app.listen(port);

}
bootstrap();
