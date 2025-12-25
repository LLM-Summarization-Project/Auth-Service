import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
// console.log('DATABASE_URL:', process.env.DATABASE_URL);

// FIX: force CommonJS import
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: 'http://localhost:8080',
      credentials: true,
    },
  });

  app.use(cookieParser());

  await app.listen(4000);
  console.log('🚀 Server running at http://localhost:4000');
}
bootstrap();
