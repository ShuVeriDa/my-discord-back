import { Module } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { PrismaService } from '../prisma.service';
import { ServerService } from '../server/server.service';
import { DirectMessageService } from '../direct-message/direct-message.service';

@Module({
  controllers: [ConversationController],
  providers: [ConversationService, PrismaService, ServerService],
})
export class ConversationModule {}
