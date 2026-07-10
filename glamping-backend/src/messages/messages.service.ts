import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { GatewayService } from '../gateway/gateway.service';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private gateway: GatewayService,
  ) {}

  async findByHouseId(houseId: string) {
    const messages = await this.prisma.chatMessage.findMany({
      where: { houseId },
      orderBy: { timestamp: 'asc' },
    });

    return messages.map((m) => ({
      id: m.id,
      houseId: m.houseId,
      sender: m.sender,
      text: m.text,
      timestamp: m.timestamp.toISOString(),
      read: m.read,
    }));
  }

  async create(houseId: string, text: string) {
    const message = await this.prisma.chatMessage.create({
      data: { houseId, sender: 'GUEST', text },
    });

    return {
      id: message.id,
      houseId: message.houseId,
      sender: message.sender,
      text: message.text,
      timestamp: message.timestamp.toISOString(),
      read: message.read,
    };
  }

  async markAsRead(id: string) {
    const message = await this.prisma.chatMessage.findUnique({ where: { id } });
    if (!message) throw new NotFoundException('Message not found');

    const updated = await this.prisma.chatMessage.update({
      where: { id },
      data: { read: true },
    });

    return {
      id: updated.id,
      houseId: updated.houseId,
      sender: updated.sender,
      text: updated.text,
      timestamp: updated.timestamp.toISOString(),
      read: updated.read,
    };
  }
}
