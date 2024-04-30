import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { FriendService } from './friend.service';
import { Server } from 'socket.io';
import { AuthWS } from '../auth/decorators/auth.decorator';
import { AddFriendDto } from './dto/addFriend.dto';
import { UserWs } from '../user/decorators/user.decorator';
import { RespondToFriendDto } from './dto/respondToFriend.dto';

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

  @SubscribeMessage('respondToFriendRequest')
  @AuthWS()
  async handleRespondToFriendRequest(
    @MessageBody() dto: RespondToFriendDto,
    @UserWs('id') userId: string,
  ) {
    const friend = await this.friendService.respondToFriendRequest(dto, userId);

    this.emitRespondFriend(dto.recipientId, friend);

    return friend;
  }

  private emitRequestFriend(recipientId: string, message: any) {
    const addKey = `friend:${recipientId}:request`;
    this.server.emit(addKey, message);
  }

  private emitRespondFriend(recipientId: string, message: any) {
    const respondFriendKey = `friend:${recipientId}:respond`;
    this.server.emit(respondFriendKey, message);
  }
}
