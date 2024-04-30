import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ConversationDto } from './dto/conversation.dto';
import { CreateConversationDto } from './dto/createConversation.dto';

@Injectable()
export class ConversationService {
  constructor(private readonly prisma: PrismaService) {}

  async fetchConversation(dto: ConversationDto, userId: string) {
    const conversation =
      (await this.getTheConversation(dto.userOneId, dto.userTwoId)) ||
      (await this.getTheConversation(dto.userTwoId, dto.userOneId));

    if (!conversation)
      throw new NotFoundException('The conversation was not found');

    const isOneOfConversation =
      conversation.userOneId === userId || conversation.userTwoId === userId;

    if (!isOneOfConversation)
      throw new ForbiddenException("You don't have rights");

    delete conversation.userOne.password;
    delete conversation.userTwo.password;

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
        AND: [{ userOneId: userId }, { userTwoId: dto.userTwoId }],
      },
    });

    if (conversation) throw new ForbiddenException('The conversation is exist');

    const createdConversation = await this.prisma.conversation.create({
      data: {
        userOneId: userId,
        userTwoId: dto.userTwoId,
      },
      include: {
        userOne: true,
        userTwo: true,
      },
    });

    delete createdConversation.userOne.password;
    delete createdConversation.userTwo.password;

    return createdConversation;
  }

  private async getTheConversation(userOneId: string, userTwoId: string) {
    return this.prisma.conversation.findFirst({
      where: {
        AND: [{ userOneId: userOneId }, { userTwoId: userTwoId }],
      },
      include: {
        userOne: true,
        userTwo: true,
      },
    });
  }
}
