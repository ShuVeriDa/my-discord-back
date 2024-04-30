import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { ConversationDto } from './dto/conversation.dto';
import { User } from '../user/decorators/user.decorator';
import { CreateConversationDto } from './dto/createConversation.dto';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @HttpCode(200)
  @Post('/fetch')
  @Auth()
  fetchConversation(@Body() dto: ConversationDto, @User('id') userId: string) {
    return this.conversationService.fetchConversation(dto, userId);
  }

  @HttpCode(200)
  @Auth()
  @Post('/create')
  createNewConversation(
    @Body() dto: CreateConversationDto,
    @User('id') userId: string,
  ) {
    return this.conversationService.createNewConversation(dto, userId);
  }
}
