import { Controller, Get, Post, Delete, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PushService } from './push.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('push')
@Controller('push')
export class PushController {
  constructor(private pushService: PushService) {}

  @Get('vapid-key')
  @Public()
  @ApiOperation({ summary: 'Get VAPID public key' })
  getVapidKey() {
    return { publicKey: this.pushService.getPublicKey() };
  }

  @Post('subscribe')
  @Public()
  @ApiOperation({ summary: 'Subscribe to push notifications' })
  subscribe(@Body() dto: SubscribeDto) {
    return this.pushService.subscribe(dto.endpoint, dto.p256dh, dto.p256da);
  }

  @Delete('unsubscribe')
  @Public()
  @ApiOperation({ summary: 'Unsubscribe from push notifications' })
  unsubscribe(@Body() body: { endpoint: string }) {
    return this.pushService.unsubscribe(body.endpoint);
  }
}
