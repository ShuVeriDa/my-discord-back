import { Module } from '@nestjs/common';
import { FriendService } from './friend.service';
import { FriendGateway } from './friend.gateway';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [FriendGateway, FriendService, PrismaService, JwtService],
})
export class FriendModule {}
