import { IsString } from 'class-validator';

export class FetchDirectMessageDto {
  @IsString()
  userTwoId: string;

  @IsString()
  conversationId: string;

  @IsString()
  cursor: string;
}
