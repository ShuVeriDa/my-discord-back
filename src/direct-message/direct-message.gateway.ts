import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { DirectMessageService } from './direct-message.service';
import { Server } from 'socket.io';
import { AuthWS } from '../auth/decorators/auth.decorator';
import { Body } from '@nestjs/common';
import { CreateDirectMessageDto } from './dto/create.dto';
import { UserWs } from '../user/decorators/user.decorator';

@WebSocketGateway()
export class DirectMessageGateway
  implements OnGatewayDisconnect, OnGatewayConnection, OnGatewayInit
{
  @WebSocketServer() server: Server;

  constructor(private readonly directMessageService: DirectMessageService) {}

  handleDisconnect(client: any) {
    console.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: any, ...args: any[]) {
    console.log(`Client connected: ${client.id} ${args}`);
  }

  afterInit(server: Server) {
    console.log('WebSocket directMessage gateway initialized');
  }

  @SubscribeMessage('sendDirectMessage')
  @AuthWS()
  async sendDirectMessage(
    @Body() dto: CreateDirectMessageDto,
    @UserWs('id') userId: string,
  ) {
    const message = await this.directMessageService.createDirectMessage(
      dto,
      userId,
    );

    this.emitCreateDirectMessages(dto.conversationId, message);

    return message;
  }

  private emitCreateDirectMessages(conversationId: string, message: any) {
    const createKey = `conversation:${conversationId}:messages:create`;
    this.server.emit(createKey, message);
  }
}
