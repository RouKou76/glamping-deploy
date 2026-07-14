import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get messages' })
  @ApiQuery({ name: 'houseId', required: false })
  async find(@Query('houseId') houseId?: string) {
    if (houseId) return this.messagesService.findByHouseId(houseId);
    return this.messagesService.findAll();
  }

  @Post()
  @Public()
  @ApiOperation({ summary: 'Send a message' })
  async create(@Body() dto: CreateMessageDto) {
    return this.messagesService.create(dto.houseId, dto.text, dto.sender);
  }

  @Post(':id/read')
  @Public()
  @ApiOperation({ summary: 'Mark message as read' })
  async markAsRead(@Param('id') id: string) {
    return this.messagesService.markAsRead(id);
  }

  @Get('history/:houseId')
  @Public()
  @ApiOperation({ summary: 'Get chat history by house' })
  async findHistory(@Param('houseId') houseId: string) {
    return this.messagesService.findHistoryByHouseId(houseId);
  }
}
