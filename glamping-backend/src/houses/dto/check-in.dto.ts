import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckInDto {
  @ApiPropertyOptional({ example: 2 })
  @IsInt()
  @Min(1)
  @Max(20)
  @IsOptional()
  guestCount?: number;

  @ApiPropertyOptional({ example: 'ru' })
  @IsString()
  @IsOptional()
  lang?: string;
}
