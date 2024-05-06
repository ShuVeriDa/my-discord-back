import { IsString } from 'class-validator';
import { ChannelType } from '@prisma/client';

export class CreateChannelDto {
  @IsString()
  name: string;

  @IsString()
  // @Matches(`^${Object.values(UserRole).filter(v => typeof v !== "number").join('|')}$`, 'i')
  type: ChannelType;

  @IsString()
  serverId: string;
}
