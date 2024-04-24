import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { DeleteChatDto } from './dto/delete-chat.dto';
import { MemberRole } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async newMessageChannel(dto: CreateChatDto, userId: string) {
    const { content, channelId, serverId, fileUrl } = dto;

    if (!content) throw new NotFoundException('Content not found');

    const { channel, member } = await this.validation(
      serverId,
      channelId,
      userId,
    );

    return this.prisma.message.create({
      data: {
        content: content,
        channelId: channel.id,
        fileUrl: fileUrl,
        memberId: member.id,
      },
      include: {
        member: true,
      },
    });
  }

  async removeMessageChannel(dto: DeleteChatDto, userId: string) {
    const { channel, member } = await this.validation(
      dto.serverId,
      dto.channelId,
      userId,
    );

    const message = await this.prisma.message.findFirst({
      where: {
        id: dto.messageId,
        channelId: channel.id,
      },
    });

    if (!message) throw new NotFoundException('The message not found');

    const isMessageOwner = message.memberId === member.id;
    const isAdmin = member.role === MemberRole.ADMIN;
    const isModerator = member.role === MemberRole.MODERATOR;

    const canModify = isMessageOwner || isAdmin || isModerator;

    if (!canModify) throw new ForbiddenException("You don't have rights");

    return this.prisma.message.update({
      where: {
        id: message.id,
      },
      data: {
        fileUrl: null,
        content: 'The message has been deleted.',
        deleted: true,
      },
      include: {
        member: true,
      },
    });
  }

  async validation(serverId: string, channelId: string, userId: string) {
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

    if (!member) throw new ForbiddenException("You don't have rights");

    return {
      server,
      channel,
      member,
      user,
    };
  }
}
