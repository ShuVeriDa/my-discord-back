import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AddFriendDto } from './dto/addFriend.dto';
import { RespondToFriendDto } from './dto/respondToFriend.dto';

@Injectable()
export class FriendService {
  constructor(private readonly prisma: PrismaService) {}

  async friendRequest(dto: AddFriendDto, userId: string) {
    const friend = await this.prisma.friend.findFirst({
      where: {
        recipientId: dto.recipientId,
        senderId: userId,
      },
    });

    if (friend)
      throw new NotFoundException(
        'A request to add a user as a friend already exists',
      );

    return this.prisma.friend.create({
      data: {
        recipientId: dto.recipientId,
        senderId: userId,
        //TODO:Add into enum
        status: 'PENDING',
      },
    });
  }

  async respondToFriendRequest(dto: RespondToFriendDto, userId: string) {
    const friend = await this.prisma.friend.findUnique({
      where: {
        id: dto.friendIdEntity,
        senderId: userId,
        recipientId: dto.recipientId,
      },
    });

    if (!friend)
      throw new ForbiddenException('The request to add a friend not found');

    if (dto.accept) {
      return this.prisma.friend.update({
        where: {
          id: friend.id,
          recipientId: friend.recipientId,
          senderId: friend.senderId,
        },
        data: {
          status: 'ACCEPTED',
        },
      });
    } else {
      return this.prisma.friend.delete({
        where: {
          id: friend.id,
          recipientId: friend.recipientId,
          senderId: friend.senderId,
        },
      });
    }
  }
}
