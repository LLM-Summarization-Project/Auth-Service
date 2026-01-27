import { IsNumber, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Username (minimum 3 characters)',
    example: 'john_doe',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({
    description: 'Password (minimum 4 characters)',
    example: 'password123',
    minLength: 4,
  })
  @IsString()
  @MinLength(4)
  password: string;
}
