import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:3000',
    ],
    credentials: true,
    allowedHeaders: [
      'Accept',
      'Authorization',
      'X-Requested-With',
      'apollo-require-preflight',
      'Content-Type',
      'Cookie',
    ],
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  });
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
