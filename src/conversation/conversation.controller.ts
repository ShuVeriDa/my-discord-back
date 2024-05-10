import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { User } from '../user/decorators/user.decorator';
import { CreateConversationDto } from './dto/createConversation.dto';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @HttpCode(200)
  @Get(':id')
  @Auth()
  fetchConversationById(
    @Param('id') conversationId: string,
    @User('id') userId: string,
  ) {
    return this.conversationService.fetchConversationById(
      conversationId,
      userId,
    );
  }

  @HttpCode(200)
  @Get('/member/:id')
  @Auth()
  fetchOrCreateConversationById(
    @Param('id') memberTwoId: string,
    @User('id') userId: string,
  ) {
    return this.conversationService.fetchOrCreateConversationById(
      memberTwoId,
      userId,
    );
  }

  @HttpCode(200)
  @Post('/create')
  @Auth()
  createNewConversation(
    @Body() dto: CreateConversationDto,
    @User('id') userId: string,
  ) {
    return this.conversationService.createNewConversation(dto, userId);
  }

  @HttpCode(200)
  @Delete(':id')
  @Auth()
  deleteConversation(
    @Param('id') conversationId: string,
    @User('id') userId: string,
  ) {
    return this.conversationService.deleteConversation(conversationId, userId);
  }
}
