import { Matches, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Username (alphanumeric and underscores only)',
    example: 'john_doe',
  })
  @IsString()
  @Matches(/^[a-zA-Z0-9_]+$/)
  username: string;

  @ApiProperty({
    description: 'Password (alphanumeric and underscores only)',
    example: 'password123',
  })
  @IsString()
  @Matches(/^[a-zA-Z0-9_]+$/)
  password: string;

  @ApiPropertyOptional({
    description: 'Login as regular user even if admin',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  loginAsUser?: boolean;
}
