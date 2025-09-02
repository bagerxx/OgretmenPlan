import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global prefix
  app.setGlobalPrefix('api');
  
  // CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.listen(3000);
  console.log('🚀 Backend çalışıyor: http://localhost:3000/api');
}
bootstrap();
