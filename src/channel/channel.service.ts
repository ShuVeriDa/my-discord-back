import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ServerService } from '../server/server.service';
import { CreateChannelDto } from './dto/create.dto';
import { MemberRole } from '@prisma/client';

@Injectable()
export class ChannelService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly serverService: ServerService,
  ) {}

  async createChannel(dto: CreateChannelDto, userId: string) {
    const { user, server, member } = await this.serverService.validateServer(
      dto.serverId,
      userId,
    );

    if (dto.name === 'general')
      throw new ForbiddenException("Name cannot be 'general'");

    const isGuest = member.role === 'GUEST';

    if (isGuest) throw new ForbiddenException("You don't have rights");

    const updatedServer = this.prismaService.server.update({
      where: {
        id: server.id,
        members: {
          some: {
            profileId: user.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          create: {
            profileId: user.id,
            name: dto.name,
            type: dto.type,
          },
        },
      },
    });

    const data = await updatedServer.channels();

    return data.map((channel) => {
      return {
        id: channel.id,
        name: channel.name,
        type: channel.type,
      };
    });
  }
}
