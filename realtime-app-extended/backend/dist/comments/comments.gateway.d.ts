import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CommentsService } from './comments.service';
export declare class CommentsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly commentsService;
    server: Server;
    private connectedUsers;
    constructor(commentsService: CommentsService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleSetUsername(data: {
        username: string;
    }, client: Socket): void;
    handleAddComment(data: {
        username: string;
        text: string;
    }, client: Socket): void;
    private broadcastOnlineCount;
}
