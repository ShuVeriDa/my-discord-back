import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { Server } from 'socket.io';
import { AuthWS } from '../auth/decorators/auth.decorator';
import { UserWs } from '../user/decorators/user.decorator';

@WebSocketGateway()
export class ChatGateway
  implements OnGatewayDisconnect, OnGatewayConnection, OnGatewayInit
{
  @WebSocketServer() server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleDisconnect(client: any) {
    console.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: any, ...args: any[]) {
    console.log(`Client connected: ${client.id} ${args}`);
  }

  afterInit(server: Server) {
    console.log('WebSocket gateway initialized');
  }

  @SubscribeMessage('createMessage')
  @AuthWS()
  async newMessageChannel(
    @MessageBody() dto: CreateChatDto,
    @UserWs('id') userId: string,
  ) {
    const createdMessage = await this.chatService.newMessageChannel(
      dto,
      userId,
    );

    this.emitMessageCreate(dto.channelId, createdMessage);

    return createdMessage;
  }

  private emitMessageCreate(channelId: string, message: any) {
    const createKey = `chat:${channelId}:messages:create`;
    this.server.emit(createKey, message);
  }
}
