import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TransfersService } from './transfers.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('transfers')
@Controller('transfers')
export class TransfersController {
  constructor(private transfersService: TransfersService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get transfer destinations' })
  async findAll() {
    return this.transfersService.findAll();
  }
}
