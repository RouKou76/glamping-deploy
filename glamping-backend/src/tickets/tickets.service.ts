import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { GatewayService } from '../gateway/gateway.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private gateway: GatewayService,
  ) {}

  async findAll(query: {
    houseId?: string;
    status?: string;
    assignedTo?: string;
  }) {
    const where: Record<string, any> = {};

    if (query.houseId) where.houseId = query.houseId;
    if (query.status) where.status = query.status;
    if (query.assignedTo) where.assignedTo = query.assignedTo;

    const tickets = await this.prisma.ticket.findMany({
      where,
      orderBy: { sentAt: 'desc' },
    });

    return tickets.map((t) => ({
      id: t.id,
      houseId: t.houseId,
      type: t.type,
      status: t.status,
      createdAt: t.sentAt.toISOString(),
      desiredAt: t.desiredAt?.toISOString(),
      description: t.description,
      geo: t.geo,
      assignedTo: t.assignedTo,
      items: (t.items as Array<Record<string, unknown>>) || undefined,
      location: t.location,
      guestCount: t.guestCount,
      priceFix: t.priceFix,
    }));
  }

  async create(dto: CreateTicketDto) {
    const ticket = await this.prisma.ticket.create({
      data: {
        houseId: dto.houseId,
        type: dto.type as never,
        description: dto.description,
        geo: dto.geo,
        assignedTo: dto.assignedTo as never,
        location: dto.location,
        guestCount: dto.guestCount,
        items: dto.items as never,
        desiredAt: dto.desiredAt ? new Date(dto.desiredAt) : undefined,
        sessionId: dto.sessionId,
      },
    });

    const result = {
      id: ticket.id,
      houseId: ticket.houseId,
      type: ticket.type,
      status: ticket.status,
      createdAt: ticket.sentAt.toISOString(),
      desiredAt: ticket.desiredAt?.toISOString(),
      description: ticket.description,
      geo: ticket.geo,
      assignedTo: ticket.assignedTo,
      items: (ticket.items as Array<Record<string, unknown>>) || undefined,
      location: ticket.location,
      guestCount: ticket.guestCount,
      priceFix: ticket.priceFix,
    };

    void this.gateway.broadcastToAdmins('server:ticket:created', result);

    return result;
  }

  async update(id: string, dto: UpdateTicketDto) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: {
        status: dto.status as never,
        assignedTo: dto.assignedTo as never,
      },
    });

    const result = {
      id: updated.id,
      houseId: updated.houseId,
      type: updated.type,
      status: updated.status,
      createdAt: updated.sentAt.toISOString(),
      desiredAt: updated.desiredAt?.toISOString(),
      description: updated.description,
      geo: updated.geo,
      assignedTo: updated.assignedTo,
      items: (updated.items as Array<Record<string, unknown>>) || undefined,
      location: updated.location,
      guestCount: updated.guestCount,
      priceFix: updated.priceFix,
    };

    void this.gateway.broadcastToAdmins('server:ticket:updated', result);

    return result;
  }
}
