import { UserRole, TenantType } from '@prisma/client';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  tenantId: string;
  iat?: number;
  exp?: number;
}

export interface JwtRefreshPayload {
  sub: string; // user id
  tokenId: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  tenant: {
    id: string;
    name: string;
    slug: string;
    type: TenantType;
  };
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
  expiresIn: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

export interface TenantContext {
  id: string;
  slug: string;
  type: TenantType;
  name: string;
}
