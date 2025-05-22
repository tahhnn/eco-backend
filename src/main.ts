import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';

async function bootstrap() {
  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('Test')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Nhập: Bearer <JWT>',
        in: 'header',
      },
      'access_token',
    )
    .build();

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // tự động loại bỏ field không khai báo trong DTO
      forbidNonWhitelisted: true, // báo lỗi nếu có field lạ
      transform: true, // tự chuyển JSON thành class DTO
      disableErrorMessages: false,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  app.enableCors({
    origin: "*",
    credential: true
  })
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(parseInt(process.env.PORT as string, 10) || 3000);
}
bootstrap();