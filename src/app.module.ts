import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ServerModule } from './server/server.module';
import { ChannelModule } from './channel/channel.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, UserModule, ServerModule, ChannelModule, FileModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
