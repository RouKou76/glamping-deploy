import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

@ApiTags('roles')
@Controller('roles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  @RequirePermissions('manage_roles')
  @ApiOperation({ summary: 'Get all roles' })
  async findAll() {
    return this.rolesService.findAll();
  }

  @Post()
  @RequirePermissions('manage_roles')
  @ApiOperation({ summary: 'Create role' })
  async create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Post(':id')
  @RequirePermissions('manage_roles')
  @ApiOperation({ summary: 'Update role' })
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('manage_roles')
  @ApiOperation({ summary: 'Delete role' })
  async remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
