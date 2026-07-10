import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { configValidationSchema } from './config/config.validation';
import { HealthController } from './health.controller';
import { AuthModule } from './auth/auth.module';
import { HousesModule } from './houses/houses.module';
import { TicketsModule } from './tickets/tickets.module';
import { MenuModule } from './menu/menu.module';
import { ServicesCatalogModule } from './services-catalog/services-catalog.module';
import { MessagesModule } from './messages/messages.module';
import { TransfersModule } from './transfers/transfers.module';
import { InfoModule } from './info/info.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
    }),
    PrismaModule,
    AuthModule,
    HousesModule,
    TicketsModule,
    MenuModule,
    ServicesCatalogModule,
    MessagesModule,
    TransfersModule,
    InfoModule,
    GatewayModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
