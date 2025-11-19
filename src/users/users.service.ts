import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async createUser(dto: CreateUserDto) {
    const hashed = await argon2.hash(dto.password);
    return this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashed,
      },
    });
  }


}
