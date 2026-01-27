import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Auth Service API')
    .setDescription('Authentication and Authorization API for the application')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addCookieAuth('access_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(process.env.PORT || 4005);
  console.log(`🚀 Server running at http://localhost:${process.env.PORT || 4005}`);
  console.log(`📚 Swagger docs at http://localhost:${process.env.PORT || 4005}/swagger`);
}
bootstrap();
