import { IsBoolean, IsString } from 'class-validator';

export class RespondToFriendDto {
  @IsString()
  friendIdEntity: string;

  @IsString()
  recipientId: string;

  @IsBoolean()
  accept: boolean;
}
