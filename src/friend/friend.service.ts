import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AddFriendDto } from './dto/addFriend.dto';

@Injectable()
export class FriendService {
  constructor(private readonly prisma: PrismaService) {}

  async friendRequest(dto: AddFriendDto, userId: string) {
    console.log(dto);

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
        status: 'PENDING',
      },
    });
  }
}
