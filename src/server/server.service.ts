import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateServerDto } from './dto/createServer.dto';
import { v4 as uuidv4 } from 'uuid';
import { MemberRole } from '@prisma/client';
import { UpdateServerDto } from './dto/updateServer.dto';

@Injectable()
export class ServerService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllServers(userId: string) {
    return this.prisma.server.findMany({
      where: {
        members: {
          some: {
            profileId: userId,
          },
        },
      },
    });
  }

  async getServerById(serverId: string, userId: string) {
    const server = await this.prisma.server.findUnique({
      where: {
        id: serverId,
        members: {
          some: { profileId: userId },
        },
      },
      include: {
        members: true,
        channels: true,
      },
    });

    if (!server) throw new NotFoundException('Server not found');

    return server;
  }

  async createServer(dto: CreateServerDto, userId: string) {
    return this.prisma.server.create({
      data: {
        profileId: userId,
        name: dto.name,
        imageUrl: dto.imageUrl,
        inviteCode: uuidv4(),
        channels: {
          create: [{ name: 'general', profileId: userId }],
        },
        members: {
          create: [{ profileId: userId, role: MemberRole.ADMIN }],
        },
      },
    });
  }

  async updateServer(dto: UpdateServerDto, serverId: string, userId: string) {
    const { member } = await this.validateServer(serverId, userId);

    const isGuest = member.role === 'GUEST';

    if (isGuest) throw new ForbiddenException('You have no rights!');

    return this.prisma.server.update({
      where: {
        id: serverId,
      },
      data: {
        name: dto.name,
        imageUrl: dto.imageUrl,
      },
    });
  }

  async leaveServer(serverId: string, userId: string) {
    const { server, member, user } = await this.validateServer(
      serverId,
      userId,
    );

    const isOwner = server.profileId === member.profileId;

    if (isOwner)
      throw new ForbiddenException('The owner сan only delete the server');

    await this.prisma.server.update({
      where: {
        id: server.id,
        profileId: {
          not: user.id,
        },
        members: {
          some: {
            profileId: user.id,
          },
        },
      },
      data: {
        members: {
          deleteMany: {
            profileId: user.id,
          },
        },
      },
    });

    return 'You have successfully logged out of the server';
  }

  async inviteCode(serverId: string, userId: string) {
    const { server, user } = await this.validateServer(serverId, userId);

    return this.prisma.server.update({
      where: {
        id: server.id,
        profileId: user.id,
      },
      data: {
        inviteCode: uuidv4(),
      },
    });
  }

  async removeServer(serverId: string, userId: string) {
    const { server, member, user } = await this.validateServer(
      serverId,
      userId,
    );

    const isOwner = server.profileId === member.profileId;
    const isAdmin = member.role === 'ADMIN';

    if (!isAdmin && !isOwner)
      throw new ForbiddenException("You don't have rights");

    await this.prisma.server.delete({
      where: {
        id: server.id,
        profileId: user.id,
      },
    });

    return 'Successful removal';
  }

  async validateServer(serverId: string, userId?: string) {
    const user = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    const server = await this.getServerById(serverId, user.id);

    const member = server.members.find(
      (member) => member.profileId === user.id,
    );

    if (!member) throw new NotFoundException("You don't have rights");

    return { user, server, member };
  }
}
