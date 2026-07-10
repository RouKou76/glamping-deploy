import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
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

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark message as read' })
  async markAsRead(@Param('id') id: string) {
    return this.messagesService.markAsRead(id);
  }
}
