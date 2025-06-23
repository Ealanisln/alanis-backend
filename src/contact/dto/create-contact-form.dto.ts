import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactFormDto {
  @ApiProperty({
    description: 'Nombre completo del contacto',
    example: 'Juan Pérez',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Email del contacto',
    example: 'juan@ejemplo.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Mensaje del contacto',
    example: 'Hola, me interesa cotizar un proyecto web...',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  message: string;

  @ApiPropertyOptional({
    description: 'Teléfono del contacto',
    example: '+52 55 1234 5678',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Empresa del contacto',
    example: 'Mi Empresa S.A.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  company?: string;

  @ApiPropertyOptional({
    description: 'Asunto del mensaje',
    example: 'Cotización proyecto web',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @ApiPropertyOptional({
    description: 'Fuente del contacto',
    example: 'website',
  })
  @IsOptional()
  @IsString()
  source?: string;
} 