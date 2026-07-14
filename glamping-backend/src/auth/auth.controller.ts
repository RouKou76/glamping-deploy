import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { checkRateLimit } from './rate-limiter';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login' })
  async login(@Body() dto: LoginDto, @Req() req: { ip?: string; connection?: { remoteAddress?: string } }) {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const { allowed, retryAfter } = checkRateLimit(ip);
    if (!allowed) {
      throw new HttpException(`Too many attempts. Retry after ${retryAfter}s`, 429);
    }
    return this.authService.login(dto);
  }

  @Post('refresh')
  @Public()
  @ApiOperation({ summary: 'Refresh tokens' })
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async getMe(@CurrentUser() user: { id: string }) {
    return this.authService.getMe(user.id);
  }
}
