import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @RequirePermissions('view_tickets')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tickets' })
  @ApiQuery({ name: 'houseId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'assignedTo', required: false })
  async findAll(
    @Query('houseId') houseId?: string,
    @Query('status') status?: string,
    @Query('assignedTo') assignedTo?: string,
    @Req() req?: Request & { user?: { role?: { name?: string } } },
  ) {
    return this.ticketsService.findAll({ houseId, status, assignedTo, userRole: req?.user?.role?.name });
  }

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create ticket (guest device)' })
  async create(@Body() dto: CreateTicketDto) {
    return this.ticketsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @RequirePermissions('manage_tickets')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update ticket' })
  async update(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.ticketsService.update(id, dto);
  }
}
