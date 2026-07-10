import { Controller, Head } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class HealthController {
  @Head('health')
  @Public()
  health() {
    return {};
  }
}
