import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // tự động loại bỏ field không khai báo trong DTO
      forbidNonWhitelisted: true, // báo lỗi nếu có field lạ
      transform: true, // tự chuyển JSON thành class DTO
      disableErrorMessages: false,
    }),
  );
  await app.listen(parseInt(process.env.PORT as string, 10));
}
bootstrap();