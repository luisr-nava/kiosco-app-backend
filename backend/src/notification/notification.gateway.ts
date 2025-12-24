import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { envs } from '../config/envs';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';

@WebSocketGateway({ cors: true })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers.authorization
          ?.toString()
          .replace('Bearer ', '');

      if (!token) {
        throw new WsException('Token requerido');
      }

      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: envs.jwtSecret,
      });

      if (!payload?.id) {
        throw new WsException('Token inválido');
      }

      client.join(payload.id);
    } catch (error) {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    client.removeAllListeners();
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: unknown, @ConnectedSocket() client: Socket) {
    client.emit('pong', data);
  }

  emitNotification(userId: string, payload: Record<string, unknown>) {
    this.server.to(userId).emit('notification', payload);
  }
}
