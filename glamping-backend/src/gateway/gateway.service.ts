import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: (
    client: Socket,
    done: (err: Error | null, origin?: string) => void,
  ) => {
    done(null, '*');
  },
})
export class GatewayService
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger('Gateway');

  constructor(private config: ConfigService) {}

  afterInit() {
    this.server.engine.opts.cors = {
      origin: this.config.get('FRONTEND_URL', '*'),
      credentials: true,
    };
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    const role = client.handshake.auth?.role as string | undefined;
    const houseId = client.handshake.auth?.houseId as string | undefined;

    if (role === 'admin') {
      void client.join('admins');
    }
    if (houseId) {
      void client.join(`house:${houseId}`);
    }

    client.emit('server:connection:status', { connected: true });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  broadcastToAdmins(event: string, payload: unknown) {
    this.server.to('admins').emit(event, payload);
  }

  sendToHouse(houseId: string, event: string, payload: unknown) {
    this.server.to(`house:${houseId}`).emit(event, payload);
  }
}
