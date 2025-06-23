import { IsOptional, IsEnum, IsDateString, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum ContactFormStatus {
  PENDING = 'PENDING',
  RESPONDED = 'RESPONDED',
  SPAM = 'SPAM',
  ARCHIVED = 'ARCHIVED',
}

export class ContactFormQueryDto {
  @ApiPropertyOptional({
    description: 'Página para paginación',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Número de elementos por página',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Estado del formulario de contacto',
    enum: ContactFormStatus,
    example: ContactFormStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(ContactFormStatus)
  status?: ContactFormStatus;

  @ApiPropertyOptional({
    description: 'Buscar por email',
    example: 'juan@ejemplo.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Buscar por nombre',
    example: 'Juan Pérez',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio para filtrar',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin para filtrar',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Fuente del contacto',
    example: 'website',
  })
  @IsOptional()
  @IsString()
  source?: string;
} 