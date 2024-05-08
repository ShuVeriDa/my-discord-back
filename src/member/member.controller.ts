import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { ChangeRoleDto } from './dto/changeRole.dto';
import { User } from '../user/decorators/user.decorator';

@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @HttpCode(200)
  @Auth()
  @Get(':id')
  fetchOneMember(@Param('id') serverId: string, @User('id') userId: string) {
    return this.memberService.fetchOneMember(serverId, userId);
  }

  @HttpCode(200)
  @Auth()
  @Patch(':id')
  changeRole(
    @Body() dto: ChangeRoleDto,
    @Param('id') memberId: string,
    @User('id') userId: string,
  ) {
    return this.memberService.changeRole(dto, memberId, userId);
  }

  @HttpCode(200)
  @Auth()
  @Delete(':id')
  removeMember(
    @Body('serverId') serverId: string,
    @Param('id') memberId: string,
    @User('id') userId: string,
  ) {
    return this.memberService.removeMember(serverId, memberId, userId);
  }
}
