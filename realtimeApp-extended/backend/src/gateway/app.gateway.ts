import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // userId -> socketId map
  private userSockets = new Map<string, string>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('register')
  handleRegister(client: Socket, userId: string) {
    this.userSockets.set(userId, client.id);
    console.log(`User ${userId} registered with socket ${client.id}`);
  }

  // Broadcast new comment to ALL connected users
  notifyNewComment(payload: any) {
    this.server.emit('new_comment', payload);
  }

  // Notify specific user of a reply
  notifyReply(targetUserId: string, payload: any) {
    const socketId = this.userSockets.get(targetUserId);
    if (socketId) {
      this.server.to(socketId).emit('new_reply', payload);
    }
  }

  // Notify specific user of a like
  notifyLike(targetUserId: string, payload: any) {
    const socketId = this.userSockets.get(targetUserId);
    if (socketId) {
      this.server.to(socketId).emit('new_like', payload);
    }
  }

  // Notify specific user of a new follower
  notifyFollow(targetUserId: string, payload: any) {
    const socketId = this.userSockets.get(targetUserId);
    if (socketId) {
      this.server.to(socketId).emit('new_follower', payload);
    }
  }
}
