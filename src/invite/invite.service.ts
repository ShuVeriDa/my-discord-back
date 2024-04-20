import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma.service';
import { ServerService } from '../server/server.service';

@Injectable()
export class InviteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly serverService: ServerService,
  ) {}

  async refreshCode(serverId: string, userId: string) {
    const { server, user } = await this.serverService.validateServer(
      serverId,
      userId,
    );

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

  async joinServer(inviteCode: string, userId: string) {
    const user = await this.prisma.profile.findUnique({
      where: {
        id: userId,
      },
    });

    const server = await this.prisma.server.findFirst({
      where: {
        inviteCode: inviteCode,
        members: {
          some: {
            NOT: { profileId: user.id },
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (!server) throw new NotFoundException('Server not found');

    const isMember = server.members.some(
      (member) => member.profileId === user.id,
    );

    if (isMember) {
      return 'You are already a member of the server';
    }

    return this.prisma.server.update({
      where: {
        inviteCode: inviteCode,
      },
      data: {
        members: {
          create: {
            profileId: user.id,
          },
        },
      },
      include: {
        members: true,
      },
    });
  }
}
