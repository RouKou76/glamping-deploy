import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  houseId: string;

  @ApiProperty()
  @IsString()
  text: string;
}
