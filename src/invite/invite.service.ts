import { ForbiddenException, Injectable } from '@nestjs/common';
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
    const { server } = await this.serverService.validateServer(
      serverId,
      userId,
    );

    return this.prisma.server.update({
      where: {
        id: server.id,
        profileId: userId,
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

    const server = await this.prisma.server.findUnique({
      where: {
        inviteCode: inviteCode,
        members: {
          some: {
            profileId: user.id,
          },
        },
      },
    });

    if (server) throw new ForbiddenException("You're already a member");

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
