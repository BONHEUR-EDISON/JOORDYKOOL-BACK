import * as dotenv from 'dotenv';
dotenv.config(); // doit être le premier import

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = process.env.PORT || 4000;

  const app = await NestFactory.create(AppModule);

  // Activer CORS
  app.enableCors({
    origin: [
      'http://localhost:3000', // dev local
      'https://joordykool-front.vercel.app', // front prod
      'https://joordykool.vercel.app/',
    ],
    credentials: true,
  });

  await app.listen(port);
  console.log(
    `🚀 Server is running on ${process.env.NODE_ENV === 'production' ? 'Render URL' : `http://localhost:${port}`}`,
  );
}

bootstrap();
