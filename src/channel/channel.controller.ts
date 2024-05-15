import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { User } from '../user/decorators/user.decorator';
import { UpdateChannelDto } from './dto/update.dto';
import { DeleteChannelDto } from './dto/delete.dto';

@Controller('channels')
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

  @HttpCode(200)
  @Auth()
  @Post()
  createChannel(@Body() dto: CreateChannelDto, @User('id') userId: string) {
    return this.channelService.createChannel(dto, userId);
  }

  @HttpCode(200)
  @Auth()
  @Patch(':id')
  updateChannel(
    @Body() dto: UpdateChannelDto,
    @Param('id') channelId: string,
    @User('id') userId: string,
  ) {
    return this.channelService.updateChannel(dto, channelId, userId);
  }

  @HttpCode(200)
  @Auth()
  @Delete(':id')
  deleteChannel(
    @Body() dto: DeleteChannelDto,
    @Param('id') channelId: string,
    @User('id') userId: string,
  ) {
    return this.channelService.deleteChannel(dto, channelId, userId);
  }
}
