import { IsOptional, IsString } from 'class-validator';

export class UpdateServerDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  imageUrl: string;
}
