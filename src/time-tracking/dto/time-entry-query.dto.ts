import {
  IsOptional,
  IsString,
  IsDate,
  IsUUID,
  IsInt,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TimeEntryQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Project ID filter',
    example: 'cuid-project-id',
  })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({
    description: 'Start date filter',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @Transform(({ value }) => new Date(value))
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'End date filter',
    example: '2024-01-31',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @Transform(({ value }) => new Date(value))
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'Search in description',
    example: 'authentication',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
