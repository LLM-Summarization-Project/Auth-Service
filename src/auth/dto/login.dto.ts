import { Matches, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9_]+$/)
  username: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9_]+$/)
  password: string;
}
