import { Matches, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9_]+$/)
  username: string;

  @IsString()
  @MinLength(4)
  @Matches(/^[a-zA-Z0-9_]+$/)
  password: string;
}
