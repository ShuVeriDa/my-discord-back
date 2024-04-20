import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/createUser.dto';
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

  async create(dto: CreateUserDto) {
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
