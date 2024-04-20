import { Module } from '@nestjs/common';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';
import { PrismaService } from '../prisma.service';
import { ServerService } from '../server/server.service';

@Module({
  controllers: [InviteController],
  providers: [InviteService, PrismaService, ServerService],
})
export class InviteModule {}
