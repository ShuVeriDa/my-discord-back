import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDto } from './dto/create.dto';
import { hash } from 'argon2';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getById(id: string) {
    return this.prisma.profile.findUnique({
      where: { id },
    });
  }

  async getByEmail(email: string) {
    return this.prisma.profile.findFirst({
      where: { email: email },
    });
  }

  async create(dto: CreateDto) {
    const profile = {
      email: dto.email,
      password: await hash(dto.password),
      name: dto.name,
      imageUrl: dto.imageUrl,
    };

    return this.prisma.profile.create({
      data: profile,
    });
  }
}
