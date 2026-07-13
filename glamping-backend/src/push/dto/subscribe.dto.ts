import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubscribeDto {
  @ApiProperty()
  @IsString()
  endpoint: string;

  @ApiProperty()
  @IsString()
  p256dh: string;

  @ApiProperty()
  @IsString()
  p256da: string;
}
