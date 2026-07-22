import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { GatewayService } from '../gateway/gateway.service';
import { UpdateInfoDto } from './dto/update-info.dto';

@Injectable()
export class InfoService {
  constructor(
    private prisma: PrismaService,
    private gateway: GatewayService,
  ) {}

  async getInfo() {
    const rows = await this.prisma.setting.findMany();
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

    return {
      title: map.title ?? '',
      phone: map.phone ?? '',
      wifiName: map.wifi_name ?? '',
      wifiPassword: map.wifi_password ?? '',
      rules: map.rules ?? '',
      description: map.description ?? '',
      servicesText: map.services_text ?? '',
    };
  }

  async updateInfo(dto: UpdateInfoDto) {
    const updates = [
      { key: 'title', value: dto.title },
      { key: 'phone', value: dto.phone },
      { key: 'wifi_name', value: dto.wifiName },
      { key: 'wifi_password', value: dto.wifiPassword },
      { key: 'rules', value: dto.rules },
      { key: 'description', value: dto.description },
      { key: 'services_text', value: dto.servicesText },
    ].filter((u) => u.value !== undefined);

    for (const update of updates) {
      await this.prisma.setting.upsert({
        where: { key: update.key },
        update: { value: update.value! },
        create: { key: update.key, value: update.value! },
      });
    }

    const info = await this.getInfo();
    this.gateway.broadcastToAdmins('server:info:updated', info);
    this.gateway.broadcastToAllHouses('server:info:updated', info);

    return info;
  }
}
