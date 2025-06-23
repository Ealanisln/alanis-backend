import { IsOptional, IsEnum, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ContactFormStatus {
  PENDING = 'PENDING',
  RESPONDED = 'RESPONDED',
  SPAM = 'SPAM',
  ARCHIVED = 'ARCHIVED',
}

export class UpdateContactFormDto {
  @ApiPropertyOptional({
    description: 'Estado del formulario de contacto',
    enum: ContactFormStatus,
    example: ContactFormStatus.RESPONDED,
  })
  @IsOptional()
  @IsEnum(ContactFormStatus)
  status?: ContactFormStatus;

  @ApiPropertyOptional({
    description: 'Respuesta del administrador',
    example: 'Hemos recibido tu solicitud y te contactaremos pronto.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  response?: string;
} 