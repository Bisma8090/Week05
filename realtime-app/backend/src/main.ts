import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

async function bootstrap() {
  // Create an Express instance
  const server = express();

  // Pass Express adapter to NestFactory
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // Enable CORS for your frontend (Next.js dev)
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true,
  });

  await app.listen(4000);
  console.log('🚀 Backend running on http://localhost:4000');
}
bootstrap();