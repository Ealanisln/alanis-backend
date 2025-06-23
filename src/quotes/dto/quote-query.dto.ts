import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { QuoteStatus } from './update-quote.dto';

export class QuoteQueryDto {
  @ApiPropertyOptional({
    description: 'Número de página para paginación',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Número de elementos por página',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Buscar por número de cotización',
    example: 'QUO-2024-0001',
  })
  @IsOptional()
  @IsString()
  quoteNumber?: string;

  @ApiPropertyOptional({
    description: 'Buscar por email del cliente',
    example: 'cliente@ejemplo.com',
  })
  @IsOptional()
  @IsString()
  clientEmail?: string;

  @ApiPropertyOptional({
    description: 'Buscar por nombre del cliente',
    example: 'Juan Pérez',
  })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado de la cotización',
    enum: QuoteStatus,
    example: QuoteStatus.SENT,
  })
  @IsOptional()
  @IsEnum(QuoteStatus)
  status?: QuoteStatus;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de proyecto',
    enum: ['web', 'ecommerce', 'custom', 'landing', 'blog'],
    example: 'web',
  })
  @IsOptional()
  @IsString()
  projectType?: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio para filtrar por fecha de creación',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin para filtrar por fecha de creación',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Ordenar por campo (createdAt, total, status)',
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  orderBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento (asc, desc)',
    example: 'desc',
    default: 'desc',
  })
  @IsOptional()
  @IsString()
  orderDirection?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Búsqueda general por texto',
    example: 'sitio web',
  })
  @IsOptional()
  @IsString()
  search?: string;
} 