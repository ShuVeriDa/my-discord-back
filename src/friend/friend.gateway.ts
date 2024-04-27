import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { FriendService } from './friend.service';
import { Server, Socket } from 'socket.io';
import { AuthWS } from '../auth/decorators/auth.decorator';
import { AddFriendDto } from './dto/addFriend.dto';
import { UserWs } from '../user/decorators/user.decorator';

@WebSocketGateway()
export class FriendGateway
  implements OnGatewayDisconnect, OnGatewayConnection, OnGatewayInit
{
  @WebSocketServer() server: Server;

  constructor(private readonly friendService: FriendService) {}

  handleDisconnect(client: any) {
    console.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: any, ...args: any[]) {
    console.log(`Client connected: ${client.id} ${args}`);
  }

  afterInit(server: Server) {
    console.log('WebSocket friends gateway initialized');
  }

  @SubscribeMessage('addFriend')
  @AuthWS()
  async addFriend(
    @MessageBody() dto: AddFriendDto,
    @UserWs('id') userId: string,
  ) {
    const friendRequest = await this.friendService.friendRequest(dto, userId);

    this.emitRequestFriend(dto.recipientId, friendRequest);

    return friendRequest;
  }

  private emitRequestFriend(recipientId: string, message: any) {
    const createKey = `friend:${recipientId}:request`;
    this.server.emit(createKey, message);
  }
}
