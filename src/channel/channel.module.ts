import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { PrismaService } from '../prisma.service';
import { ServerService } from '../server/server.service';

@Module({
  controllers: [ChannelController],
  providers: [ChannelService, PrismaService, ServerService],
})
export class ChannelModule {}
