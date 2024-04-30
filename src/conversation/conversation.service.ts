import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateConversationDto } from './dto/createConversation.dto';

@Injectable()
export class ConversationService {
  constructor(private readonly prisma: PrismaService) {}

  async fetchConversation(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
      },
      include: {
        userOne: true,
        userTwo: true,
      },
    });

    if (!conversation)
      throw new NotFoundException('The conversation was not found');

    const isConversationParticipant =
      conversation.userOneId === userId || conversation.userTwoId === userId;

    if (!isConversationParticipant)
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
}
