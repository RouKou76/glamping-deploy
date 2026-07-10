import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';

interface DeviceRequest extends Request {
  house?: Record<string, unknown>;
  session?: Record<string, unknown> | null;
}

@Injectable()
export class DeviceGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<DeviceRequest>();
    const deviceToken = request.headers['x-device-token'] as string | undefined;

    if (!deviceToken) {
      throw new UnauthorizedException('Device token required');
    }

    const house = await this.prisma.house.findUnique({
      where: { deviceToken },
      include: {
        sessions: { where: { isActive: true }, take: 1 },
      },
    });

    if (!house) {
      throw new UnauthorizedException('Invalid device token');
    }

    request.house = house;
    request.session = house.sessions[0] || null;

    return true;
  }
}
