export class CreateChatDto {
  serverId: string;
  channelId: string;
  content: string;
  fileUrl?: string;
}
