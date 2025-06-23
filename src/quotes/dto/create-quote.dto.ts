import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  IsNumber,
  IsPositive,
  IsDateString,
  IsObject,
  IsInt,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuoteServiceDto {
  @ApiProperty({
    description: 'ID del servicio',
    example: 'web-basic',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Nombre del servicio',
    example: 'Sitio Web Básico',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Precio base del servicio',
    example: 15000,
  })
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  basePrice: number;

  @ApiPropertyOptional({
    description: 'Configuraciones adicionales del servicio',
    example: { pages: 5, responsive: true },
  })
  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Horas estimadas para el servicio',
    example: 40,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  estimatedHours?: number;
}

export class CreateQuoteDto {
  @ApiProperty({
    description: 'Nombre del cliente',
    example: 'Juan Pérez',
  })
  @IsString()
  clientName: string;

  @ApiProperty({
    description: 'Email del cliente',
    example: 'juan@ejemplo.com',
  })
  @IsEmail()
  clientEmail: string;

  @ApiPropertyOptional({
    description: 'Teléfono del cliente',
    example: '+52 55 1234 5678',
  })
  @IsOptional()
  @IsString()
  clientPhone?: string;

  @ApiPropertyOptional({
    description: 'Empresa del cliente',
    example: 'Empresa XYZ',
  })
  @IsOptional()
  @IsString()
  clientCompany?: string;

  @ApiProperty({
    description: 'Nombre del proyecto',
    example: 'Sitio Web Corporativo',
  })
  @IsString()
  projectName: string;

  @ApiProperty({
    description: 'Tipo de proyecto',
    enum: ['web', 'ecommerce', 'custom', 'landing', 'blog'],
    example: 'web',
  })
  @IsString()
  projectType: string;

  @ApiPropertyOptional({
    description: 'Descripción del proyecto',
    example: 'Sitio web corporativo con 5 páginas principales',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Lista de servicios cotizados',
    type: [QuoteServiceDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteServiceDto)
  services: QuoteServiceDto[];

  @ApiProperty({
    description: 'Subtotal de la cotización',
    example: 25000,
  })
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  subtotal: number;

  @ApiPropertyOptional({
    description: 'Impuestos aplicados',
    example: 4000,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value || 0))
  tax?: number;

  @ApiPropertyOptional({
    description: 'Descuento aplicado',
    example: 2500,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value || 0))
  discount?: number;

  @ApiProperty({
    description: 'Total de la cotización',
    example: 26500,
  })
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  total: number;

  @ApiPropertyOptional({
    description: 'Horas totales estimadas',
    example: 60,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  estimatedHours?: number;

  @ApiPropertyOptional({
    description: 'Días de entrega estimados',
    example: 15,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  deliveryDays?: number;

  @ApiPropertyOptional({
    description: 'Fecha de validez de la cotización',
    example: '2024-02-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional({
    description: 'Notas adicionales para el cliente',
    example: 'Incluye hosting por 1 año',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Notas internas (no visibles para el cliente)',
    example: 'Cliente referido por Juan García',
  })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiPropertyOptional({
    description: 'Metadata adicional de la cotización',
    example: { calculatorVersion: '2.0', source: 'web' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
} 