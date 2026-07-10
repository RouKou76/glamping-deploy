import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
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

  @Put(':id/checkin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check in to house' })
  async checkin(@Param('id') id: string, @Body() dto: CheckInDto) {
    return this.housesService.checkin(id, dto);
  }

  @Put(':id/checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check out from house' })
  async checkout(@Param('id') id: string) {
    return this.housesService.checkout(id);
  }
}
