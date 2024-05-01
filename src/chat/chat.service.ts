import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { DeleteChatDto } from './dto/delete-chat.dto';
import { MemberRole } from '@prisma/client';
import { UpdateChatDto } from './dto/update-chat.dto';
import { FetchChatDto } from './dto/fetch-chat.dto';

@Injectable()
export class ChatService {
  MESSAGES_BATCH = 10;

  constructor(private readonly prisma: PrismaService) {}

  async fetchMessagesChannel(dto: FetchChatDto, userId: string) {
    const { channelId, serverId, cursor } = dto;

    const { channel } = await this.validation(serverId, channelId, userId);

    let messages = [];

    if (cursor) {
      messages = await this.prisma.message.findMany({
        take: this.MESSAGES_BATCH,
        skip: 1,
        cursor: {
          id: cursor,
        },
        where: {
          channelId: channel.id,
        },
        include: {
          member: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      messages = await this.prisma.message.findMany({
        take: this.MESSAGES_BATCH,
        where: {
          channelId: channel.id,
        },
        include: {
          member: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    let nextCursor = null;

    if (messages.length === this.MESSAGES_BATCH) {
      nextCursor = messages[this.MESSAGES_BATCH - 1].id;
    }

    return { messages, nextCursor };
  }

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

  async editMessageChannel(dto: UpdateChatDto, userId: string) {
    const { channel, member } = await this.validation(
      dto.serverId,
      dto.channelId,
      userId,
    );

    const { message } = await this.validateMessage(
      dto.messageId,
      channel.id,
      member.id,
      member.role,
    );

    return this.prisma.message.update({
      where: {
        id: message.id,
      },
      data: {
        content: dto.content,
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

    const { message } = await this.validateMessage(
      dto.messageId,
      channel.id,
      member.id,
      member.role,
    );

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

  // Validate //

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

  async validateMessage(
    messageId: string,
    channelId: string,
    memberId: string,
    memberRole: MemberRole,
  ) {
    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        channelId: channelId,
      },
    });

    if (!message) throw new NotFoundException('The message not found');

    const isMessageOwner = message.memberId === memberId;
    const isAdmin = memberRole === MemberRole.ADMIN;
    const isModerator = memberRole === MemberRole.MODERATOR;

    const canModify = isMessageOwner || isAdmin || isModerator;

    if (!canModify) throw new ForbiddenException("You don't have rights");

    return { message };
  }
}
