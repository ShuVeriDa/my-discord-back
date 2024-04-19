import { Module } from '@nestjs/common';
import { ServerService } from './server.service';
import { ServerController } from './server.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ServerController],
  providers: [ServerService, PrismaService],
})
export class ServerModule {}
