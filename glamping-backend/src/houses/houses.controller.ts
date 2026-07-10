import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HousesService } from './houses.service';
import { CheckInDto } from './dto/check-in.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('houses')
@Controller('houses')
export class HousesController {
  constructor(private housesService: HousesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all houses' })
  async findAll() {
    return this.housesService.findAll();
  }

  @Get('sessions')
  @Public()
  @ApiOperation({ summary: 'Get active sessions' })
  async findSessions() {
    return this.housesService.findSessions();
  }

  @Post(':id/check-in')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check in to house' })
  async checkin(@Param('id') id: string, @Body() dto: CheckInDto) {
    return this.housesService.checkin(id, dto);
  }

  @Post(':id/check-out')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check out from house' })
  async checkout(@Param('id') id: string) {
    return this.housesService.checkout(id);
  }

  @Post(':id/device-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate device token for house' })
  async generateDeviceToken(@Param('id') id: string) {
    return this.housesService.generateDeviceToken(id);
  }

  @Delete(':id/device-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reset device token' })
  async resetDeviceToken(@Param('id') id: string) {
    return this.housesService.resetDeviceToken(id);
  }
}
