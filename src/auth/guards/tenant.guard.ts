import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TENANT_KEY } from '../../common/decorators/auth.decorators';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredTenant = this.reflector.getAllAndOverride<string>(
      TENANT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredTenant) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.tenant) {
      throw new ForbiddenException('No tenant context found');
    }

    if (user.tenant.slug !== requiredTenant) {
      throw new ForbiddenException(
        `Access denied. Required tenant: ${requiredTenant}`,
      );
    }

    return true;
  }
}
