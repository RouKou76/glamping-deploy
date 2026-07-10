import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { GatewayService } from '../gateway/gateway.service';
import { CheckInDto } from './dto/check-in.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class HousesService {
  constructor(
    private prisma: PrismaService,
    private gateway: GatewayService,
  ) {}

  async findSessions() {
    const sessions = await this.prisma.guestSession.findMany({
      where: { isActive: true },
      include: { house: true },
    });

    return sessions.map((s) => ({
      id: s.id,
      houseId: s.houseId,
      houseNumber: s.house.number,
      guestCount: s.guestCount,
      lang: s.lang,
      checkInAt: s.checkInAt?.toISOString(),
    }));
  }

  async findAll() {
    const houses = await this.prisma.house.findMany({
      include: {
        sessions: { where: { isActive: true }, take: 1 },
      },
      orderBy: { number: 'asc' },
    });

    return houses.map((h) => ({
      id: h.id,
      number: h.number,
      status: h.status,
      guestCount: h.sessions[0]?.guestCount ?? undefined,
      lang: h.sessions[0]?.lang ?? 'ru',
      checkInAt: h.sessions[0]?.checkInAt?.toISOString() ?? undefined,
    }));
  }

  async checkin(houseId: string, dto: CheckInDto) {
    const house = await this.prisma.house.findUnique({
      where: { id: houseId },
    });
    if (!house) throw new NotFoundException('House not found');

    if (house.status === 'occupied') {
      throw new BadRequestException('House is already occupied');
    }

    const session = await this.prisma.guestSession.create({
      data: {
        houseId,
        guestCount: dto.guestCount,
        lang: dto.lang || 'ru',
        checkInAt: new Date(),
      },
    });

    await this.prisma.house.update({
      where: { id: houseId },
      data: { status: 'occupied' },
    });

    this.gateway.broadcastToAdmins('server:house:updated', {
      id: houseId,
      number: house.number,
      status: 'occupied',
      guestCount: dto.guestCount,
      lang: dto.lang || 'ru',
      checkInAt: session.checkInAt?.toISOString(),
    });

    return {
      id: houseId,
      number: house.number,
      status: 'occupied' as const,
      guestCount: dto.guestCount,
      lang: dto.lang || 'ru',
      checkInAt: session.checkInAt?.toISOString(),
    };
  }

  async generateDeviceToken(houseId: string) {
    const house = await this.prisma.house.findUnique({
      where: { id: houseId },
    });
    if (!house) throw new NotFoundException('House not found');

    const token = `glamp-${house.number}-${randomBytes(16).toString('hex')}`;

    await this.prisma.house.update({
      where: { id: houseId },
      data: { deviceToken: token },
    });

    return { houseId, number: house.number, deviceToken: token };
  }

  async resetDeviceToken(houseId: string) {
    const house = await this.prisma.house.findUnique({
      where: { id: houseId },
    });
    if (!house) throw new NotFoundException('House not found');

    await this.prisma.house.update({
      where: { id: houseId },
      data: { deviceToken: null },
    });

    return { houseId, number: house.number, deviceToken: null };
  }

  async checkout(houseId: string) {
    return this.prisma.$transaction(async (tx) => {
      const session = await tx.guestSession.findFirst({
        where: { houseId, isActive: true },
      });

      if (!session) {
        throw new BadRequestException('No active session found');
      }

      await tx.ticket.updateMany({
        where: {
          sessionId: session.id,
          status: { in: ['new', 'accepted', 'in_progress'] },
        },
        data: { status: 'archived' },
      });

      await tx.guestSession.update({
        where: { id: session.id },
        data: { isActive: false, checkOutAt: new Date() },
      });

      const house = await tx.house.update({
        where: { id: houseId },
        data: { status: 'vacant' },
      });

      this.gateway.broadcastToAdmins('server:house:updated', {
        id: houseId,
        number: house.number,
        status: 'vacant',
      });

      return {
        id: houseId,
        number: house.number,
        status: 'vacant' as const,
      };
    });
  }
}
