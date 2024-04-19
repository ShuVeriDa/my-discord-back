import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateServerDto } from './dto/createServer.dto';
import { v4 as uuidv4 } from 'uuid';
import { MemberRole } from '@prisma/client';

@Injectable()
export class ServerService {
  constructor(private readonly prisma: PrismaService) {}

  async createServer(dto: CreateServerDto, userId: string) {
    const user = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    return this.prisma.server.create({
      data: {
        profileId: user.id,
        name: dto.name,
        imageUrl: dto.imageUrl,
        inviteCode: uuidv4(),
        channels: {
          create: [{ name: 'general', profileId: user.id }],
        },
        members: {
          create: [{ profileId: user.id, role: MemberRole.ADMIN }],
        },
      },
    });
  }
}
