import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async newMessageChannel(dto: CreateChatDto, userId: string) {
    const { content, channelId, serverId, fileUrl } = dto;

    if (!content) throw new NotFoundException('Content not found');

    const user = await this.prisma.profile.findUnique({
      where: {
        id: userId,
      },
    });

    const server = await this.prisma.server.findUnique({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: user.id,
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (!server) throw new NotFoundException('Server not found');

    const channel = await this.prisma.channel.findFirst({
      where: {
        id: channelId,
        serverId: server.id,
      },
    });

    if (!channel) throw new NotFoundException('Channel not found');

    const member = server.members.find(
      (member) => member.profileId === user.id,
    );

    if (!member) throw new NotFoundException("You don't have rights");

    return this.prisma.message.create({
      data: {
        content: content,
        channelId: channelId as string,
        fileUrl: fileUrl,
        memberId: member.id,
      },
      include: {
        member: true,
      },
    });
  }
}
