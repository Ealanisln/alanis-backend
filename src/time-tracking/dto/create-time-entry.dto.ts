import {
  IsString,
  IsNumber,
  IsDate,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTimeEntryDto {
  @ApiProperty({
    description: 'Description of the work performed',
    example: 'Implementing user authentication',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Number of hours worked',
    example: 2.5,
    minimum: 0.1,
  })
  @IsNumber()
  @Min(0.1)
  hours: number;

  @ApiProperty({
    description: 'Date of the work',
    example: '2024-01-15',
  })
  @IsDate()
  @Type(() => Date)
  @Transform(({ value }) => new Date(value))
  date: Date;

  @ApiProperty({
    description: 'Project ID',
    example: 'cuid-project-id',
  })
  @IsUUID()
  projectId: string;

  @ApiPropertyOptional({
    description: 'Task ID (optional)',
    example: 'cuid-task-id',
  })
  @IsOptional()
  @IsUUID()
  taskId?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Had some issues with OAuth integration',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Hourly rate for this entry (overrides project rate)',
    example: 75.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;
}
