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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) { }

  // Generate a color from user ID (consistent hashing) - same algorithm as hypertext-onto-backend
  private getUserColor(userId: number): string {
    // Simple hash to get a Hue (0-360)
    const hash = (userId * 2654435761) % 360;

    // Convert HSL to RGB (Saturation 70%, Lightness 50%)
    const s = 0.7;
    const l = 0.5;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((hash / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;
    if (0 <= hash && hash < 60) { r = c; g = x; b = 0; }
    else if (60 <= hash && hash < 120) { r = x; g = c; b = 0; }
    else if (120 <= hash && hash < 180) { r = 0; g = c; b = x; }
    else if (180 <= hash && hash < 240) { r = 0; g = x; b = c; }
    else if (240 <= hash && hash < 300) { r = x; g = 0; b = c; }
    else if (300 <= hash && hash < 360) { r = c; g = 0; b = x; }

    const rVal = Math.round((r + m) * 255);
    const gVal = Math.round((g + m) * 255);
    const bVal = Math.round((b + m) * 255);

    return "#" + ((1 << 24) + (rVal << 16) + (gVal << 8) + bVal).toString(16).slice(1);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user', description: 'Creates a new user account with username and password' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Invalid input or username already exists' })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user', description: 'Authenticates user and sets HTTP-only cookies with tokens' })
  @ApiResponse({ status: 200, description: 'Login successful, cookies set' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } = await this.auth.login(dto);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000 * 999999,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { success: true, user };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token', description: 'Uses refresh token from cookies to generate new access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @ApiCookieAuth()
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];

    const newAccess = await this.auth.refreshFromCookie(refreshToken);

    res.cookie('access_token', newAccess, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    return { success: true };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user', description: 'Clears authentication cookies' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user', description: 'Returns the authenticated user\'s profile with color' })
  @ApiResponse({ status: 200, description: 'Current user profile returned' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth()
  me(@Req() req: Request) {
    const user = req.user as { id: number; username: string; role: string };
    return {
      ...user,
      color: this.getUserColor(user.id),
    };
  }
}
