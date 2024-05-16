import { IsString } from 'class-validator';

export class JoinServerDto {
  @IsString()
  inviteCode: string;
}
