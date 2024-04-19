import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { User } from '../user/decorators/user.decorator';

@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get(':serverId')
  @Auth()
  async getAllChannels(
    @Param('id') serverId: string,
    @User('id') userId: string,
  ) {
    return this.channelService.getAllChannels(serverId, userId);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Auth()
  @Post(':id')
  async getChannelById(
    @Param('id') channelId: string,
    @Body('id') serverId: string,
    @User('id') userId: string,
  ) {
    return this.channelService.getChannelById(channelId, serverId, userId);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Auth()
  @Post()
  createChannel(@Body() dto: CreateChannelDto, @User('id') userId: string) {
    return this.channelService.createChannel(dto, userId);
  }
}
