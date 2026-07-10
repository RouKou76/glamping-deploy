import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  houseId: string;

  @ApiProperty()
  @IsString()
  text: string;

  @ApiPropertyOptional({ enum: ['GUEST', 'STAFF'] })
  @IsString()
  @IsOptional()
  sender?: string;
}
