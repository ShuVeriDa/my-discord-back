import { Module } from '@nestjs/common';
import { DirectMessageService } from './direct-message.service';
import { DirectMessageGateway } from './direct-message.gateway';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConversationService } from '../conversation/conversation.service';
import { ServerService } from '../server/server.service';

@Module({
  providers: [
    DirectMessageGateway,
    DirectMessageService,
    ConversationService,
    PrismaService,
    JwtService,
    ServerService,
  ],
})
export class DirectMessageModule {}
