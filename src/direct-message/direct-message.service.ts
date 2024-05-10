import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDirectMessageDto } from './dto/create.dto';
import { ConversationService } from '../conversation/conversation.service';
import { FetchDirectMessageDto } from './dto/fetch.dto';
import { UpdateDirectMessageDto } from './dto/update.dto';
import { DeleteDirectMessageDto } from './dto/delete.dto';
import { DeleteAllDirectMessagesDto } from './dto/deleteAll.dto';

@Injectable()
export class DirectMessageService {
  MESSAGES_BATCH = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly conversationService: ConversationService,
  ) {}

  async fetchDirectMessages(dto: FetchDirectMessageDto, userId: string) {
    const conversation = await this.conversationService.fetchConversationById(
      dto.conversationId,
      userId,
    );

    const IsUserTwo =
      conversation.memberTwoId === dto.userTwoId ||
      conversation.memberOneId === dto.userTwoId;

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
          member: true,
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
    const conversation = await this.conversationService.fetchConversationById(
      dto.conversationId,
      userId,
    );

    const isConversationParticipant =
      conversation.memberTwoId === dto.userTwoId ||
      conversation.memberOneId === dto.userTwoId;

    if (!isConversationParticipant)
      throw new ForbiddenException("You don't have rights");

    const message = await this.prisma.directMessage.create({
      data: {
        content: dto.content,
        fileUrl: dto.fileUrl,
        conversationId: conversation.id,
        memberId: userId,
      },
      include: {
        conversation: true,
        member: true,
      },
    });

    return message;
  }

  async updateDirectMessage(dto: UpdateDirectMessageDto, userId: string) {
    const directMessage = await this.validateDirectMessage(
      dto.conversationId,
      dto.messageId,
      userId,
    );

    return this.prisma.directMessage.update({
      where: {
        id: directMessage.id,
      },
      data: {
        content: dto.content,
        fileUrl: dto.fileUrl,
      },
      include: {
        member: true,
        conversation: true,
      },
    });
  }

  async deleteDirectMessage(dto: DeleteDirectMessageDto, userId: string) {
    const directMessage = await this.validateDirectMessage(
      dto.conversationId,
      dto.messageId,
      userId,
    );

    return this.prisma.directMessage.update({
      where: {
        id: directMessage.id,
      },
      data: {
        fileUrl: null,
        content: 'This message has been deleted.',
        deleted: true,
      },
      include: {
        conversation: true,
        member: true,
      },
    });
  }

  async deleteAllDirectMessages(
    dto: DeleteAllDirectMessagesDto,
    userId: string,
  ) {
    const conversation = await this.conversationService.fetchConversationById(
      dto.conversationId,
      userId,
    );

    const IsUserTwo =
      conversation.memberTwoId === dto.userTwoId ||
      conversation.memberOneId === dto.userTwoId;

    if (!IsUserTwo) throw new ForbiddenException("You don't have rights");

    await this.prisma.directMessage.deleteMany({
      where: {
        conversationId: conversation.id,
      },
    });

    return this.prisma.directMessage.findMany({
      where: {
        conversationId: conversation.id,
      },
    });
  }

  async validateDirectMessage(
    conversationId: string,
    messageId: string,
    userId: string,
  ) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          {
            memberOneId: userId,
          },
          {
            memberTwoId: userId,
          },
        ],
      },
      include: {
        memberOne: true,
        memberTwo: true,
      },
    });

    if (!conversation)
      throw new NotFoundException('The conversation not found');

    const profile =
      conversation.memberOneId === userId
        ? conversation.memberOne
        : conversation.memberTwo;

    if (!profile) throw new NotFoundException('The participant was not found');

    const directMessage = await this.prisma.directMessage.findFirst({
      where: {
        id: messageId,
        conversationId: conversation.id,
      },
      include: {
        member: true,
      },
    });

    if (!directMessage || directMessage.deleted)
      throw new NotFoundException('Message not found');

    const isUserOwner = directMessage.memberId === profile.id;

    if (!isUserOwner) throw new ForbiddenException("You don't have rights");

    return directMessage;
  }
}
