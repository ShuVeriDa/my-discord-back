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
import { DeleteChatDto } from './dto/delete-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { FetchChatDto } from './dto/fetch-chat.dto';
import { Logger } from '@nestjs/common';

@WebSocketGateway()
export class ChatGateway
  implements OnGatewayDisconnect, OnGatewayConnection, OnGatewayInit
{
  @WebSocketServer() server: Server;

  private readonly logger: Logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: any, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id} ${args}`);
  }

  afterInit(server: Server) {
    this.logger.log('WebSocket chat gateway initialized');
  }

  @SubscribeMessage('fetchMessagesChannel')
  @AuthWS()
  async fetchMessagesChannel(
    @MessageBody() dto: FetchChatDto,
    @UserWs('id') userId: string,
  ) {
    const fetchMessages = await this.chatService.fetchMessagesChannel(
      dto,
      userId,
    );

    this.emitFetchMessages(dto.channelId, fetchMessages);

    return fetchMessages;
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

  @SubscribeMessage('editMessage')
  @AuthWS()
  async editMessageChannel(
    @MessageBody() dto: UpdateChatDto,
    @UserWs('id') userId: string,
  ) {
    const editedMessage = await this.chatService.editMessageChannel(
      dto,
      userId,
    );

    this.emitMessageUpdate(dto.channelId, editedMessage);

    return editedMessage;
  }

  @SubscribeMessage('deleteMessage')
  @AuthWS()
  async removeMessageChannel(
    @MessageBody() dto: DeleteChatDto,
    @UserWs('id') userId: string,
  ) {
    const deletedMessage = await this.chatService.removeMessageChannel(
      dto,
      userId,
    );

    this.emitMessageUpdate(dto.channelId, deletedMessage);

    return deletedMessage;
  }

  //emit

  private emitFetchMessages(channelId: string, message: any) {
    const fetchKey = `chat:${channelId}:messages`;
    this.server.emit(fetchKey, message);
  }

  private emitMessageCreate(channelId: string, message: any) {
    const createKey = `chat:${channelId}:messages:create`;
    this.server.emit(createKey, message);
  }

  private emitMessageUpdate(channelId: string, message: any) {
    const updateKey = `chat:${channelId}:messages:update`;
    this.server.emit(updateKey, message);
  }
}
