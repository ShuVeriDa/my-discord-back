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

  async getServerByProfileId(userId: string) {
    const server = await this.prisma.server.findFirst({
      where: {
        members: {
          some: { profileId: userId },
        },
      },
    });

    if (!server) throw new NotFoundException('Server not found');

    return server;
  }

  async getServerByInviteCode(inviteCode: string, userId: string) {
    const server = await this.prisma.server.findFirst({
      where: {
        inviteCode: inviteCode,
        members: {
          some: {
            NOT: { profileId: userId },
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (!server) throw new NotFoundException('Server not found');

    const isMember = server.members.some(
      (member) => member.profileId === userId,
    );

    if (isMember) {
      return 'You are already a member of the server';
    }

    return server;
  }

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

    const isGuest = member.role === MemberRole.GUEST;

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
    const { server, member } = await this.validateServer(serverId, userId);

    const isOwner = server.profileId === member.profileId;

    if (isOwner)
      throw new ForbiddenException('The owner сan only delete the server');

    await this.prisma.server.update({
      where: {
        id: server.id,
        profileId: {
          not: userId,
        },
        members: {
          some: {
            profileId: userId,
          },
        },
      },
      data: {
        members: {
          deleteMany: {
            profileId: userId,
          },
        },
      },
    });

    return 'You have successfully logged out of the server';
  }

  async removeServer(serverId: string, userId: string) {
    const { server, member } = await this.validateServer(serverId, userId);

    const isOwner = server.profileId === member.profileId;
    const isAdmin = member.role === MemberRole.ADMIN;

    if (!isAdmin && !isOwner)
      throw new ForbiddenException("You don't have rights");

    await this.prisma.server.delete({
      where: {
        id: server.id,
        profileId: userId,
      },
    });

    return 'Successful removal';
  }

  async validateServer(serverId: string, userId: string) {
    const server = await this.getServerById(serverId, userId);

    const member = server.members.find((member) => member.profileId === userId);

    if (!member) throw new NotFoundException("You don't have rights");

    return { server, member };
  }
}
