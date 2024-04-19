import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ServerService } from './server.service';
import { CreateServerDto } from './dto/createServer.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { User } from '../user/decorators/user.decorator';

@Controller('server')
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  @Auth()
  @Get()
  async getAllServers(@User('id') userId: string) {
    return this.serverService.getAllServers(userId);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Auth()
  @Post()
  async createServer(@Body() dto: CreateServerDto, @User('id') userId: string) {
    return this.serverService.createServer(dto, userId);
  }
}
