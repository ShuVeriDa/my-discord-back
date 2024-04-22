import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Profile } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as process from 'node:process';

export const User = createParamDecorator(
  (data: keyof Profile, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user[data] : user;
  },
);

export const UserWs = createParamDecorator(
  (data: keyof Profile, context: ExecutionContext) => {
    const client = context.switchToWs().getClient();
    const token = client.handshake.headers.authorization.split(' ')[0];

    const jwtService = new JwtService(); // Создаем новый экземпляр сервиса JWT

    const decoded = jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });

    return data ? decoded[data] : decoded;
  },
);
