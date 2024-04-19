import { IsString } from 'class-validator';
import { ChannelType } from '@prisma/client';

export class CreateChannelDto {
  @IsString()
  name: string;

  @IsString()
  type: ChannelType;

  @IsString()
  serverId: string;
}
