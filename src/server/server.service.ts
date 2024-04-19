import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateServerDto } from './dto/createServer.dto';
import { v4 as uuidv4 } from 'uuid';
import { MemberRole } from '@prisma/client';

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
}
