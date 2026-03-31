import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class WebsocketGateway {
  @WebSocketServer()
  server: Server;

  sendComment(data: any) {
    this.server.emit('new_comment', data);
  }

  sendNotification(userId: string, data: any) {
    this.server.to(userId).emit('notification', data);
  }
}