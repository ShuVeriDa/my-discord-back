import { IsString } from 'class-validator';

export class ConversationDto {
  @IsString()
  serverId: string;

  @IsString()
  memberTwoId: string;
}
