import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTicketDto {
  @ApiPropertyOptional({
    enum: ['new', 'accepted', 'in_progress', 'done', 'archived'],
  })
  @IsEnum(['new', 'accepted', 'in_progress', 'done', 'archived'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ enum: ['cook', 'cleaning', 'driver', 'admin'] })
  @IsEnum(['cook', 'cleaning', 'driver', 'admin'])
  @IsOptional()
  assignedTo?: string;
}
