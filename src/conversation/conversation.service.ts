import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateConversationDto } from './dto/createConversation.dto';
import { ConversationDto } from './dto/conversation.dto';
import { ServerService } from '../server/server.service';

@Injectable()
export class ConversationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly serverService: ServerService,
  ) {}

  async fetchOrCreateConversationById(dto: ConversationDto, userId: string) {
    const { server } = await this.serverService.validateServer(
      dto.serverId,
      userId,
    );

    const isMember = server.members.some(
      (member) => member.id === dto.memberTwoId,
    );

    if (!isMember) throw new NotFoundException('The two member not found');

    let conversation =
      (await this.fetchConversationByIds(userId, dto.memberTwoId)) ||
      (await this.fetchConversationByIds(dto.memberTwoId, userId));

    if (!conversation)
      conversation = await this.createNewConversation(
        { userTwoId: dto.memberTwoId },
        userId,
      );

    delete conversation.memberOneId;
    delete conversation.memberTwoId;

    return conversation;
  }

  async fetchConversationById(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
      },
      include: {
        memberOne: true,
        memberTwo: true,
      },
    });

    if (!conversation)
      throw new NotFoundException('The conversation was not found');

    const isConversationParticipant =
      conversation.memberOneId === userId ||
      conversation.memberTwoId === userId;

    if (!isConversationParticipant)
      throw new ForbiddenException("You don't have rights");

    delete conversation.memberOneId;
    delete conversation.memberTwoId;

    return conversation;
  }

  async createNewConversation(dto: CreateConversationDto, userId: string) {
    const userTwo = await this.prisma.profile.findUnique({
      where: {
        id: dto.userTwoId,
      },
    });

    if (!userTwo) throw new NotFoundException('The user not found');

    const conversation = await this.prisma.conversation.findFirst({
      where: {
        AND: [{ memberOneId: userId }, { memberTwoId: dto.userTwoId }],
      },
    });

    if (conversation) throw new ForbiddenException('The conversation is exist');

    const createdConversation = await this.prisma.conversation.create({
      data: {
        memberOneId: userId,
        memberTwoId: dto.userTwoId,
      },
      include: {
        memberOne: true,
        memberTwo: true,
      },
    });

    return createdConversation;
  }

  async deleteConversation(conversationId: string, userId: string) {
    const conversation = await this.fetchConversationById(
      conversationId,
      userId,
    );

    await this.prisma.conversation.delete({
      where: {
        id: conversation.id,
      },
    });

    return 'The conversation has been deleted';
  }

  async fetchConversationByIds(userOneId: string, userTwoId: string) {
    return this.prisma.conversation.findFirst({
      where: {
        AND: [{ memberOneId: userOneId }, { memberTwoId: userTwoId }],
      },
      include: {
        memberOne: true,
        memberTwo: true,
      },
    });
  }
}
