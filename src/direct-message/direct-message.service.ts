import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDirectMessageDto } from './dto/create.dto';
import { ConversationService } from '../conversation/conversation.service';

@Injectable()
export class DirectMessageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly conversationService: ConversationService,
  ) {}

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
