import { Controller, Get, Param } from '@nestjs/common';
import { CallService } from './call.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { User } from '../user/decorators/user.decorator';

@Controller('calls')
export class CallController {
  constructor(private readonly callService: CallService) {}

  @Get(':id')
  @Auth()
  async joinCallRoom(@Param('id') roomId: string, @User('id') userId: string) {
    return this.callService.joinCallRoom(roomId, userId);
  }
}
