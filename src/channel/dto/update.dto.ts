import { IsOptional, IsString } from 'class-validator';
import { ChannelType } from '@prisma/client';

export class UpdateChannelDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  type: ChannelType;

  @IsString()
  serverId: string;
}
