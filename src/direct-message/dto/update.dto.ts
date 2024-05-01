import { IsOptional, IsString } from 'class-validator';

export class UpdateDirectMessageDto {
  @IsString()
  messageId: string;

  @IsString()
  conversationId: string;

  @IsOptional()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  fileUrl: string;
}
