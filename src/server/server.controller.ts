import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ServerService } from './server.service';
import { CreateServerDto } from './dto/createServer.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { User } from '../user/decorators/user.decorator';
import { UpdateServerDto } from './dto/updateServer.dto';

@Controller('server')
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  @Auth()
  @Get()
  async getAllServers(@User('id') userId: string) {
    return this.serverService.getAllServers(userId);
  }

  @Auth()
  @Get(':id')
  async getServerById(
    @Param('id') serverId: string,
    @User('id') userId: string,
  ) {
    return this.serverService.getServerById(serverId, userId);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Auth()
  @Post()
  async createServer(@Body() dto: CreateServerDto, @User('id') userId: string) {
    return this.serverService.createServer(dto, userId);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Auth()
  @Patch(':id')
  async updateServer(
    @Body() dto: UpdateServerDto,
    @Param('id') serverId: string,
    @User('id') userId: string,
  ) {
    return this.serverService.updateServer(dto, serverId, userId);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Auth()
  @Patch(':id/leave')
  async leaveServer(@Param('id') serverId: string, @User('id') userId: string) {
    return this.serverService.leaveServer(serverId, userId);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Auth()
  @Patch(':id/invite-code')
  async inviteCode(@Param('id') serverId: string, @User('id') userId: string) {
    return this.serverService.inviteCode(serverId, userId);
  }

  @HttpCode(200)
  @Auth()
  @Delete(':id')
  async removeServer(
    @Param('id') serverId: string,
    @User('id') userId: string,
  ) {
    return this.serverService.removeServer(serverId, userId);
  }
}
