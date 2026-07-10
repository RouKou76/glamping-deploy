import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsObject,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateServiceDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  priceInfo?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiPropertyOptional({ enum: ['cook', 'cleaning', 'driver', 'admin'] })
  @IsEnum(['cook', 'cleaning', 'driver', 'admin'])
  @IsOptional()
  assignedTo?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  fields?: Record<string, any>;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  items?: any[];

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  jsonSchema?: Record<string, any>;
}
