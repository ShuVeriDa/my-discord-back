import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ServerModule } from './server/server.module';
import { ChannelModule } from './channel/channel.module';
import { FileModule } from './file/file.module';
import { MemberModule } from './member/member.module';
import { InviteModule } from './invite/invite.module';
import { ChatModule } from './chat/chat.module';
import { FriendModule } from './friend/friend.module';
import { ConversationModule } from './conversation/conversation.module';
import { DirectMessageModule } from './direct-message/direct-message.module';
import { CallModule } from './call/call.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    UserModule,
    ServerModule,
    ChannelModule,
    FileModule,
    MemberModule,
    InviteModule,
    ChatModule,
    FriendModule,
    ConversationModule,
    DirectMessageModule,
    CallModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
