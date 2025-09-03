import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global prefix
  app.setGlobalPrefix('api');
  
  // CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // EJS view engine
  (app as any).setBaseViewsDir(join(__dirname, '..', 'views'));
  (app as any).setViewEngine('ejs');

  await app.listen(3000);
  console.log('🚀 Backend çalışıyor: http://localhost:3000/api');
}
bootstrap();
