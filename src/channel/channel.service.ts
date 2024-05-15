import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ServerService } from '../server/server.service';
import { CreateChannelDto } from './dto/create.dto';
import { MemberRole } from '@prisma/client';
import { UpdateChannelDto } from './dto/update.dto';
import { DeleteChannelDto } from './dto/delete.dto';

@Injectable()
export class ChannelService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly serverService: ServerService,
  ) {}

  async getAllChannels(serverId: string, userId: string) {
    const { server } = await this.validateServer(serverId, userId);

    return server.channels;
  }

  async getChannelById(channelId: string, serverId: string, userId: string) {
    const { server } = await this.validateServer(serverId, userId);

    const channel = await this.prisma.channel.findUnique({
      where: {
        id: channelId,
        serverId: server.id,
      },
    });

    const isChannelInServer = server.channels.some(
      (obj) => obj.id === channel.id,
    );

    if (!channel || !isChannelInServer)
      throw new NotFoundException('Channel not found');

    return channel;
  }

  async createChannel(dto: CreateChannelDto, userId: string) {
    const { server, member } = await this.serverService.validateServer(
      dto.serverId,
      userId,
    );

    if (dto.name === 'general')
      throw new ForbiddenException("Name cannot be 'general'");

    const isGuest = member.role === MemberRole.GUEST;

    if (isGuest) throw new ForbiddenException("You don't have rights");

    const updatedServer = this.prisma.server.update({
      where: {
        id: server.id,
        members: {
          some: {
            profileId: userId,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          create: {
            profileId: userId,
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

  async updateChannel(
    dto: UpdateChannelDto,
    channelId: string,
    userId: string,
  ) {
    const { user, server, member } = await this.validateServer(
      dto.serverId,
      userId,
    );

    const isGuest = member.role === MemberRole.GUEST;

    if (isGuest) throw new ForbiddenException('You have no rights!');

    const channel = await this.getChannelById(channelId, server.id, user.id);

    if (!channel) throw new NotFoundException('Channel not found');

    await this.prisma.server.update({
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
      include: {
        channels: true,
      },
      data: {
        channels: {
          update: {
            where: {
              id: channel.id,
              NOT: {
                name: 'general',
              },
            },
            data: {
              name: dto.name,
              type: dto.type,
            },
          },
        },
      },
    });

    return this.prisma.channel.findUnique({
      where: {
        id: channel.id,
        serverId: server.id,
      },
    });
  }

  async deleteChannel(
    dto: DeleteChannelDto,
    channelId: string,
    userId: string,
  ) {
    const { user, server, member } = await this.validateServer(
      dto.serverId,
      userId,
    );

    const isGuest = member.role === MemberRole.GUEST;

    if (isGuest) throw new ForbiddenException('You have no rights!');

    const channel = await this.getChannelById(channelId, server.id, user.id);

    if (!channel) throw new NotFoundException('Channel not found');

    await this.prisma.server.update({
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
          delete: {
            id: channelId,
            name: {
              not: 'general',
            },
          },
        },
      },
    });

    return 'Channel has been deleted';
  }

  async validateServer(serverId: string, userId: string) {
    const user = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    const server = await this.prisma.server.findFirst({
      where: {
        id: serverId,
        members: {
          some: { profileId: user.id },
        },
      },
      include: {
        members: true,
        channels: true,
      },
    });

    if (!server) throw new NotFoundException('Server not found');

    const member = server.members.find(
      (member) => member.profileId === user.id,
    );

    if (!member) throw new NotFoundException("You don't have rights");

    return { server, member, user };
  }
}
