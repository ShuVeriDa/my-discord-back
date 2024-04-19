import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateDto {
  @IsEmail()
  email: string;

  @MinLength(6, {
    message: 'Password must be at least 6 characters long',
  })
  @IsString()
  password: string;

  @IsString()
  @MinLength(2, {
    message: 'Name name cannot be less than 3 characters',
  })
  name: string;

  @IsString()
  imageUrl: string;
}
