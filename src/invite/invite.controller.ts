import {
  Body,
  Controller,
  HttpCode,
  Param,
  Patch,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InviteService } from './invite.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { User } from '../user/decorators/user.decorator';

@Controller('invites')
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @HttpCode(200)
  @Auth()
  @Patch()
  async joinServer(
    @Body('inviteCode') inviteCode: string,
    @User('id') userId: string,
  ) {
    return this.inviteService.joinServer(inviteCode, userId);
  }

  @HttpCode(200)
  @Auth()
  @Patch(':id')
  async refreshCode(@Param('id') serverId: string, @User('id') userId: string) {
    return this.inviteService.refreshCode(serverId, userId);
  }
}
