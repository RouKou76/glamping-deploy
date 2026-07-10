import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: (client: Socket, done: (err: Error | null, origin?: string) => void) => {
    done(null, '*');
  },
})
export class GatewayService implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private config: ConfigService) {}

  afterInit() {
    this.server.engine.opts.cors = {
      origin: this.config.get('FRONTEND_URL', '*'),
      credentials: true,
    };
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    const role = client.handshake.auth?.role;
    const houseId = client.handshake.auth?.houseId;

    if (role === 'admin') {
      client.join('admins');
    }
    if (houseId) {
      client.join(`house:${houseId}`);
    }

    client.emit('server:connection:status', { connected: true });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  broadcastToAdmins(event: string, payload: unknown) {
    this.server.to('admins').emit(event, payload);
  }

  sendToHouse(houseId: string, event: string, payload: unknown) {
    this.server.to(`house:${houseId}`).emit(event, payload);
  }
}
