import { IsString } from 'class-validator';

export class DeleteAllDirectMessagesDto {
  @IsString()
  userTwoId: string;

  @IsString()
  conversationId: string;
}
