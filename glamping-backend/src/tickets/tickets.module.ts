import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TasksController } from '../tasks/tasks.controller';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [GatewayModule],
  controllers: [TicketsController, TasksController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
