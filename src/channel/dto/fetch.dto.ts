import { IsString } from 'class-validator';

export class FetchChannelDto {
  @IsString()
  serverId: string;
}
