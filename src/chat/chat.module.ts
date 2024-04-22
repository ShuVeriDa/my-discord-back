import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { PrismaService } from '../prisma.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Module({
  providers: [
    ChatGateway,
    ChatService,
    PrismaService,
    AuthService,
    JwtService,
    UserService,
  ],
})
export class ChatModule {}
