import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  houseId: string;

  @ApiProperty()
  @IsString()
  @MaxLength(5000)
  text: string;

  @ApiPropertyOptional({ enum: ['GUEST', 'STAFF'] })
  @IsString()
  @IsOptional()
  sender?: string;
}
