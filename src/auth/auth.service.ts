import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
  ) {}

  // ---------------- REGISTER ---------------- //
  async register(dto: RegisterDto) {
    const exists = await this.users.findByUsername(dto.username);
    if (exists) {
      throw new ConflictException('Username already exists');
    }

    return this.users.createUser(dto);
  }

  // ---------------- LOGIN ---------------- //
  async login(dto: LoginDto) {
    const user = await this.users.findByUsername(dto.username);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const valid = await argon2.verify(user.password, dto.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid password');
    }

    const accessToken = await this.jwt.signAsync(
      {
        sub: user.id,
        username: user.username,
      },
      { expiresIn: '15m' },
    );

    const refreshToken = await this.jwt.signAsync(
      { sub: user.id },
      { expiresIn: '7d' },
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
      },
    };
  }

  // ---------------- REFRESH token ---------------- //
  async refreshFromCookie(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    let payload: any;

    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: process.env.JWT_SECRET,
      });
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newAccessToken = await this.jwt.signAsync(
      { sub: payload.sub },
      { expiresIn: '15m' },
    );

    return newAccessToken;
  }
}
