import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CommentsService } from './comments.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },
})
export class CommentsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Track connected users: socketId -> username
  private connectedUsers = new Map<string, string>();

  constructor(private readonly commentsService: CommentsService) {}

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  handleConnection(client: Socket) {
    console.log(`✅ Client connected: ${client.id}`);

    // Send existing comments to the newly connected client
    const existingComments = this.commentsService.getAll();
    client.emit('load_comments', existingComments);

    // Broadcast updated online count
    this.broadcastOnlineCount();
  }

  handleDisconnect(client: Socket) {
    const username = this.connectedUsers.get(client.id);
    this.connectedUsers.delete(client.id);
    console.log(`❌ Client disconnected: ${client.id} (${username ?? 'unknown'})`);
    this.broadcastOnlineCount();
  }

  // ─── Events ───────────────────────────────────────────────────────────────

  /**
   * Client registers a username when they join.
   * Payload: { username: string }
   */
  @SubscribeMessage('set_username')
  handleSetUsername(
    @MessageBody() data: { username: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.connectedUsers.set(client.id, data.username);
    this.broadcastOnlineCount();
  }

  /**
   * Client submits a new comment.
   * Payload: { username: string; text: string }
   */
  @SubscribeMessage('add_comment')
  handleAddComment(
    @MessageBody() data: { username: string; text: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data.text?.trim() || !data.username?.trim()) return;

    const comment = this.commentsService.add(data.username, data.text.trim());

    // Broadcast the new comment to ALL connected clients
    this.server.emit('new_comment', comment);

    // Send a notification to everyone EXCEPT the sender
    client.broadcast.emit('comment_notification', {
      username: data.username,
      text: data.text.trim(),
    });

    console.log(`💬 New comment from ${data.username}: ${data.text}`);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private broadcastOnlineCount() {
    this.server.emit('online_count', this.server.sockets.sockets.size);
  }
}