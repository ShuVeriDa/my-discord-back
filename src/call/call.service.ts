import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';

import { AccessToken } from 'livekit-server-sdk';

@Injectable()
export class CallService {
  constructor(private readonly prisma: PrismaService) {}

  async joinCallRoom(roomId: string, userId: string) {
    const user = await this.prisma.profile.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new NotFoundException('The User not found');

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl)
      throw new ForbiddenException('Server misconfigured');

    const at = new AccessToken(apiKey, apiSecret, {
      identity: user.name,
      // name: user.name,
    });
    at.addGrant({
      room: roomId,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    console.log({ success: 'Successfully joined' });

    return { token: at.toJwt() };
  }
}
