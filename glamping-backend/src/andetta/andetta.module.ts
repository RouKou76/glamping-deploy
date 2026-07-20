import { Module } from '@nestjs/common';
import { AndettaService } from './andetta.service';
import { AndettaController } from './andetta.controller';

@Module({
  controllers: [AndettaController],
  providers: [AndettaService],
  exports: [AndettaService],
})
export class AndettaModule {}
