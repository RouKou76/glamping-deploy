import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { Request } from 'express';

interface UserWithRole {
  role?: { permissions?: string[] };
}

interface AuthRequest extends Request {
  user?: UserWithRole;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions) {
      return true;
    }
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const user = request.user;
    if (!user?.role) {
      return false;
    }
    return requiredPermissions.some((permission) =>
      user.role!.permissions?.includes(permission),
    );
  }
}
