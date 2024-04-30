import { IsString } from 'class-validator';

export class ConversationDto {
  @IsString()
  userOneId: string;

  @IsString()
  userTwoId: string;
}
