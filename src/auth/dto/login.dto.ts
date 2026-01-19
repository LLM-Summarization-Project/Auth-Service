import { Matches, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class LoginDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9_]+$/)
  username: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9_]+$/)
  password: string;

  @IsOptional()
  @IsBoolean()
  loginAsUser?: boolean;
}
