import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class TransfersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const destinations = await this.prisma.transferDestination.findMany();
    return destinations.map((d) => ({
      id: d.id,
      name: d.name,
      km: d.km,
      price: d.price,
    }));
  }
}
