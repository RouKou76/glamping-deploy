import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import * as argon2 from 'argon2';

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

  async remove(id: string, password: string, userId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
    if (!role) throw new NotFoundException('Роль не найдена');
    if (role.name === 'admin')
      throw new BadRequestException('Нельзя удалить роль admin');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) throw new UnauthorizedException('Неверный пароль');

    if (role._count.users > 0) {
      await this.prisma.user.updateMany({
        where: { roleId: id },
        data: { roleId: '' },
      });
    }

    return this.prisma.role.delete({ where: { id } });
  }
}
