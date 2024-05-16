import { Body, Controller, HttpCode, Param, Patch } from '@nestjs/common';
import { InviteService } from './invite.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { User } from '../user/decorators/user.decorator';
import { JoinServerDto } from './dto/joinServer.dto';

@Controller('invites')
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @HttpCode(200)
  @Auth()
  @Patch()
  async joinServer(@Body() dto: JoinServerDto, @User('id') userId: string) {
    return this.inviteService.joinServer(dto.inviteCode, userId);
  }

  @HttpCode(200)
  @Auth()
  @Patch(':id')
  async refreshCode(@Param('id') serverId: string, @User('id') userId: string) {
    return this.inviteService.refreshCode(serverId, userId);
  }
}
