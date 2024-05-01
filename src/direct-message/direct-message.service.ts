import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDirectMessageDto } from './dto/create.dto';
import { ConversationService } from '../conversation/conversation.service';
import { FetchDirectMessageDto } from './dto/fetch.dto';

@Injectable()
export class DirectMessageService {
  MESSAGES_BATCH = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly conversationService: ConversationService,
  ) {}

  async fetchDirectMessages(dto: FetchDirectMessageDto, userId: string) {
    const conversation = await this.conversationService.fetchConversation(
      dto.conversationId,
      userId,
    );

    const IsUserTwo =
      conversation.userTwoId === dto.userTwoId ||
      conversation.userOneId === dto.userTwoId;

    if (!IsUserTwo) throw new ForbiddenException("You don't have rights");

    let messages = [];

    if (dto.cursor) {
      messages = await this.prisma.directMessage.findMany({
        take: this.MESSAGES_BATCH,
        skip: 1,
        cursor: {
          id: dto.cursor,
        },
        where: {
          conversationId: conversation.id,
        },
        include: {
          conversation: true,
          profile: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      messages = await this.prisma.directMessage.findMany({
        take: this.MESSAGES_BATCH,
        where: {
          conversationId: conversation.id,
        },
        include: {
          conversation: true,
          profile: true,
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

    const modifiedMessages = messages.map((message) => {
      delete message.profile.password;
      delete message.profile.email;
      delete message.profile.createdAt;
      delete message.profile.updatedAt;

      return message;
    });

    return { messages: modifiedMessages, nextCursor };
  }

  async createDirectMessage(dto: CreateDirectMessageDto, userId: string) {
    const conversation = await this.conversationService.fetchConversation(
      dto.conversationId,
      userId,
    );

    const IsUserTwo =
      conversation.userTwoId === dto.userTwoId ||
      conversation.userOneId === dto.userTwoId;

    if (!IsUserTwo) throw new ForbiddenException("You don't have rights");

    const message = await this.prisma.directMessage.create({
      data: {
        content: dto.content,
        fileUrl: dto.fileUrl,
        conversationId: conversation.id,
        profileId: userId,
      },
      include: {
        conversation: true,
        profile: true,
      },
    });

    delete message.profile.password;
    delete message.profile.email;
    delete message.profile.createdAt;
    delete message.profile.updatedAt;

    return message;
  }
}
