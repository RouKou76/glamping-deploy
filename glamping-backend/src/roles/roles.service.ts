import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const roles = await this.prisma.role.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { name: 'asc' },
    });

    return roles.map((r) => ({
      id: r.id,
      name: r.name,
      permissions: r.permissions,
      userCount: r._count.users,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.prisma.role.findUnique({
      where: { name: dto.name },
    });
    if (existing)
      throw new BadRequestException('Роль с таким именем уже существует');

    return this.prisma.role.create({
      data: { name: dto.name, permissions: dto.permissions || [] },
    });
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Роль не найдена');
    if (role.name === 'admin')
      throw new BadRequestException('Нельзя изменить роль admin');

    if (dto.name && dto.name !== role.name) {
      const existing = await this.prisma.role.findUnique({
        where: { name: dto.name },
      });
      if (existing)
        throw new BadRequestException('Роль с таким именем уже существует');
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        name: dto.name,
        permissions: dto.permissions,
      },
    });
  }

  async remove(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
    if (!role) throw new NotFoundException('Роль не найдена');
    if (role.name === 'admin')
      throw new BadRequestException('Нельзя удалить роль admin');
    if (role._count.users > 0)
      throw new BadRequestException(
        'Нельзя удалить роль с привязанными пользователями',
      );

    return this.prisma.role.delete({ where: { id } });
  }
}
