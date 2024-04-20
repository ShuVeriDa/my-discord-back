import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ChangeRoleDto } from './dto/changeRole.dto';

@Injectable()
export class MemberService {
  constructor(private readonly prisma: PrismaService) {}

  async changeRole(dto: ChangeRoleDto, memberId: string, userId: string) {
    const { server, member, user } = await this.validateMember(
      dto.serverId,
      memberId,
      userId,
    );

    return this.prisma.server.update({
      where: {
        id: server.id,
      },
      data: {
        members: {
          update: {
            where: {
              id: member.id,
              profileId: {
                not: user.id,
              },
            },
            data: {
              role: dto.role,
            },
          },
        },
      },
      include: {
        members: {
          orderBy: {
            role: 'asc',
          },
        },
      },
    });
  }

  async removeMember(serverId: string, memberId: string, userId: string) {
    const { server, member, user } = await this.validateMember(
      serverId,
      memberId,
      userId,
    );

    return this.prisma.server.update({
      where: {
        id: server.id,
      },
      data: {
        members: {
          deleteMany: {
            id: member.id,
            profileId: {
              not: user.id,
            },
          },
        },
      },
      include: {
        members: {
          orderBy: {
            role: 'asc',
          },
        },
      },
    });
  }

  async validateMember(serverId: string, memberId: string, userId: string) {
    const user = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    const server = await this.prisma.server.findFirst({
      where: {
        id: serverId,
      },
      include: {
        members: true,
      },
    });

    if (!server) throw new NotFoundException('Server not found');

    const isGuest =
      server.members.find((m) => m.profileId === user.id).role === 'GUEST';

    if (isGuest) throw new ForbiddenException("You don't have rights");

    const member = server.members.find((m) => m.id === memberId);

    if (!member) throw new NotFoundException('Member not found');

    return { user, member, server };
  }
}
