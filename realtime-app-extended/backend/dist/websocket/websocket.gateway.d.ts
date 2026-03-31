import { Server } from 'socket.io';
export declare class WebsocketGateway {
    server: Server;
    sendComment(data: any): void;
    sendNotification(userId: string, data: any): void;
}
