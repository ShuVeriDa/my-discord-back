import { IsString } from 'class-validator';

export class DeleteDirectMessageDto {
  @IsString()
  messageId: string;

  @IsString()
  conversationId: string;
}
