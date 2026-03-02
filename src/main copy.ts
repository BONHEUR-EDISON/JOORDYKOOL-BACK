import * as dotenv from 'dotenv';
dotenv.config(); // doit être le premier import

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  console.log('AFRICASTALKING_USERNAME:', process.env.AFRICASTALKING_USERNAME);
  console.log('AFRICASTALKING_API_KEY:', process.env.AFRICASTALKING_API_KEY);

  const app = await NestFactory.create(AppModule);

  // ✅ Activer CORS
  app.enableCors({
    origin: 'http://localhost:3000', // ton frontend Next.js
    credentials: true, // si tu utilises les cookies
  });

  await app.listen(process.env.PORT ?? 4000);
  console.log('🚀 Server is running on http://localhost:4000');
}
bootstrap();
