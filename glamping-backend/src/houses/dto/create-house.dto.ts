import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHouseDto {
  @ApiProperty({ example: 7 })
  @IsInt()
  @Min(1)
  number: number;
}
