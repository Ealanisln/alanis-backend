import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser, TenantContext } from '../types/auth.types';

export const ROLES_KEY = 'roles';
export const PUBLIC_KEY = 'isPublic';
export const TENANT_KEY = 'tenant';

interface RequestWithUser {
  user: AuthenticatedUser;
}

/**
 * Decorator to get the current authenticated user
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);

/**
 * Decorator to get the current tenant context
 */
export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TenantContext | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user?.tenant;
  },
);

/**
 * Decorator to get the current user ID
 */
export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user?.id;
  },
);

/**
 * Decorator to set required roles for a route
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Decorator to mark a route as public (no authentication required)
 */
export const Public = () => SetMetadata(PUBLIC_KEY, true);

/**
 * Decorator to require specific tenant access
 */
export const RequireTenant = (tenantSlug?: string) =>
  SetMetadata(TENANT_KEY, tenantSlug);
