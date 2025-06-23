import { PartialType } from '@nestjs/swagger';
import { CreateQuoteDto } from './create-quote.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum QuoteStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  CONVERTED = 'CONVERTED',
}

export class UpdateQuoteDto extends PartialType(CreateQuoteDto) {
  @ApiPropertyOptional({
    description: 'Estado de la cotización',
    enum: QuoteStatus,
    example: QuoteStatus.SENT,
  })
  @IsOptional()
  @IsEnum(QuoteStatus)
  status?: QuoteStatus;
}