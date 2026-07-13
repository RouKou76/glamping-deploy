import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateHouseDto {
  @ApiPropertyOptional({ example: 8 })
  @IsInt()
  @Min(1)
  @IsOptional()
  number?: number;
}
