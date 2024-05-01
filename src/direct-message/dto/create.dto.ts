import { IsOptional, IsString } from 'class-validator';

export class CreateDirectMessageDto {
  @IsString()
  userTwoId: string;

  @IsString()
  conversationId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  fileUrl: string;
}
