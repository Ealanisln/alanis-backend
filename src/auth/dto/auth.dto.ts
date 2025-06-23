import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { UserRole, TenantType } from '@prisma/client';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@alanis.dev',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'securePassword123',
    minLength: 6,
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({
    description: 'Tenant slug for multi-tenant access',
    example: 'alanis-web-dev',
    required: false,
  })
  @IsString({ message: 'Tenant slug must be a string' })
  @IsOptional()
  tenantSlug?: string;
}

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'newuser@alanis.dev',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'securePassword123',
    minLength: 6,
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  lastName: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.USER,
    required: false,
  })
  @IsEnum(UserRole, { message: 'Please provide a valid user role' })
  @IsOptional()
  role?: UserRole;

  @ApiProperty({
    description: 'Tenant ID for assignment',
    example: 'tenant-id-123',
  })
  @IsString({ message: 'Tenant ID must be a string' })
  @IsNotEmpty({ message: 'Tenant ID is required' })
  tenantId: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString({ message: 'Refresh token must be a string' })
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken: string;
}

export class CreateTenantDto {
  @ApiProperty({
    description: 'Tenant name',
    example: 'Alanis Web Development',
  })
  @IsString({ message: 'Tenant name must be a string' })
  @IsNotEmpty({ message: 'Tenant name is required' })
  @MaxLength(100, { message: 'Tenant name cannot exceed 100 characters' })
  name: string;

  @ApiProperty({
    description: 'Tenant slug (unique identifier)',
    example: 'alanis-web-dev',
  })
  @IsString({ message: 'Tenant slug must be a string' })
  @IsNotEmpty({ message: 'Tenant slug is required' })
  @MaxLength(50, { message: 'Tenant slug cannot exceed 50 characters' })
  slug: string;

  @ApiProperty({
    description: 'Tenant type',
    enum: TenantType,
    example: TenantType.ALANIS_WEB_DEV,
  })
  @IsEnum(TenantType, { message: 'Please provide a valid tenant type' })
  @IsNotEmpty({ message: 'Tenant type is required' })
  type: TenantType;

  @ApiProperty({
    description: 'Tenant domain (optional)',
    example: 'alanis.dev',
    required: false,
  })
  @IsString({ message: 'Domain must be a string' })
  @IsOptional()
  domain?: string;
}
