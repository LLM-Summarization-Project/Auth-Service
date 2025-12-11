import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,         // <--- THIS loads .env globally
      envFilePath: '.env',    // <--- Force load .env from project root
    }),
    PrismaModule, UsersModule, AuthModule],
})
export class AppModule {}
