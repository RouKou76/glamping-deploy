import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import { Server, Socket } from 'socket.io';

interface SocketUserData {
  id: string;
  email: string;
  role: { name: string; permissions: string[] } | null;
}

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

  constructor(
    private config: ConfigService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  afterInit() {
    this.server.engine.opts.cors = {
      origin: this.config.get('FRONTEND_URL', '*'),
      credentials: true,
    };
  }

  async handleConnection(client: Socket) {
    const token =
      (client.handshake.auth?.token as string) ||
      (client.handshake.query?.token as string);

    const houseId = client.handshake.auth?.houseId as string | undefined;

    if (token) {
      try {
        const payload = await this.jwtService.verifyAsync<{ sub: string }>(
          token,
        );
        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
          include: { role: true },
        });
        if (user) {
          (client.data as { user: SocketUserData }).user = {
            id: user.id,
            email: user.email,
            role: user.role,
          };
          if (user.role?.name === 'admin') {
            void client.join('admins');
          }
        }
      } catch {
        this.logger.warn(`Invalid JWT from client ${client.id}`);
        client.disconnect();
        return;
      }
    }

    if (houseId) {
      void client.join(`house:${houseId}`);
    }

    this.logger.log(`Client connected: ${client.id}`);
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
