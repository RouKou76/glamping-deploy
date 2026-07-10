import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { GatewayService } from '../gateway/gateway.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesCatalogService {
  constructor(
    private prisma: PrismaService,
    private gateway: GatewayService,
  ) {}

  async findAll(showInactive = false) {
    const where = showInactive ? {} : { active: true };
    const services = await this.prisma.service.findMany({ where });
    return services.map((s) => ({
      id: s.id,
      name: s.name,
      requiresTime: (s.fields as any)?.requiresTime ?? false,
      priceInfo: s.price,
      icon: s.icon,
      jsonSchema: s.jsonSchema,
      active: s.active,
      assignedTo: s.assignedTo,
    }));
  }

  async create(dto: CreateServiceDto) {
    const service = await this.prisma.service.create({
      data: {
        name: dto.name,
        price: dto.priceInfo,
        icon: dto.icon,
        active: dto.active ?? true,
        assignedTo: dto.assignedTo as any,
        fields: dto.fields || {},
        items: dto.items || undefined,
        jsonSchema: dto.jsonSchema || undefined,
      },
    });

    this.gateway.broadcastToAdmins('server:services:updated', await this.findAll(true));

    return {
      id: service.id,
      name: service.name,
      requiresTime: (service.fields as any)?.requiresTime ?? false,
      priceInfo: service.price,
      icon: service.icon,
      jsonSchema: service.jsonSchema,
      active: service.active,
      assignedTo: service.assignedTo,
    };
  }

  async update(id: string, dto: UpdateServiceDto) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');

    const updated = await this.prisma.service.update({
      where: { id },
      data: {
        name: dto.name,
        price: dto.priceInfo,
        icon: dto.icon,
        active: dto.active,
        assignedTo: dto.assignedTo as any,
        fields: dto.fields,
        items: dto.items,
        jsonSchema: dto.jsonSchema,
      },
    });

    this.gateway.broadcastToAdmins('server:services:updated', await this.findAll(true));

    return {
      id: updated.id,
      name: updated.name,
      requiresTime: (updated.fields as any)?.requiresTime ?? false,
      priceInfo: updated.price,
      icon: updated.icon,
      jsonSchema: updated.jsonSchema,
      active: updated.active,
      assignedTo: updated.assignedTo,
    };
  }

  async delete(id: string) {
    await this.prisma.service.delete({ where: { id } });
    this.gateway.broadcastToAdmins('server:services:updated', await this.findAll(true));
  }
}
