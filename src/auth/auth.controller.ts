import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  // ---------------- REGISTER ---------------- //
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  // ---------------- LOGIN (SET COOKIES) ---------------- //
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } = await this.auth.login(dto);

    // Set Access Token Cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: false, // true if HTTPS
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Set Refresh Token Cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { success: true, user };
  }

  // ---------------- REFRESH TOKEN (FROM COOKIE) ---------------- //
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      return { success: false, message: 'No refresh token' };
    }

    const newAccessToken = await this.auth.refreshFromCookie(refreshToken);

    // Set New Access Token
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    return { success: true, accessToken: newAccessToken };
  }

  // ---------------- LOGOUT ---------------- //
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { success: true, message: 'Logged out' };
  }

  // ---------------- PROTECTED ROUTE ---------------- //
@UseGuards(JwtAuthGuard)
@Get('me')
me(@Req() req: Request) {
  return req.user;
}

}
