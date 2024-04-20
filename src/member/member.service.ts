import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ChangeRoleDto } from './dto/changeRole.dto';
import { MemberRole } from '@prisma/client';

@Injectable()
export class MemberService {
  constructor(private readonly prisma: PrismaService) {}

  async changeRole(dto: ChangeRoleDto, memberId: string, userId: string) {
    const user = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    const server = await this.prisma.server.findFirst({
      where: {
        id: dto.serverId,
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

    if (!member) throw new ForbiddenException("You don't have rights");

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
}
