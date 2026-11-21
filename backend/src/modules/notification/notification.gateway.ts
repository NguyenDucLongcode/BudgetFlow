import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/',
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const userId = (client.handshake.query.userId ||
      client.handshake.auth?.userId) as string;

    if (userId) {
      const room = `user_${userId}`;
      client.join(room);
      this.logger.log(`Client ${client.id} joined room ${room}`);
    } else {
      this.logger.log(`Client ${client.id} connected`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    if (data?.userId) {
      const room = `user_${data.userId}`;
      client.join(room);
      this.logger.log(`Client ${client.id} explicitly joined ${room}`);
      return { event: 'joined', data: { room } };
    }
  }

  /**
   * Phát sự kiện khi một giao dịch dự kiến được hoàn thành tự động
   */
  sendTransactionCompleted(userId: string, data: any) {
    if (!this.server) {
      this.logger.warn('WebSocket server is not initialized yet');
      return;
    }
    const room = `user_${userId}`;
    this.logger.log(`Emitting transaction_completed to room ${room}`);
    this.server.to(room).emit('transaction_completed', data);
  }

  /**
   * Phát thông báo chung tới người dùng
   */
  sendNotification(userId: string, notification: any) {
    if (!this.server) return;
    this.server.to(`user_${userId}`).emit('notification', notification);
  }
}
