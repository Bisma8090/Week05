"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const comments_service_1 = require("./comments.service");
let CommentsGateway = class CommentsGateway {
    constructor(commentsService) {
        this.commentsService = commentsService;
        this.connectedUsers = new Map();
    }
    handleConnection(client) {
        console.log(`✅ Client connected: ${client.id}`);
        const existingComments = this.commentsService.getAll();
        client.emit('load_comments', existingComments);
        this.broadcastOnlineCount();
    }
    handleDisconnect(client) {
        const username = this.connectedUsers.get(client.id);
        this.connectedUsers.delete(client.id);
        console.log(`❌ Client disconnected: ${client.id} (${username ?? 'unknown'})`);
        this.broadcastOnlineCount();
    }
    handleSetUsername(data, client) {
        this.connectedUsers.set(client.id, data.username);
        this.broadcastOnlineCount();
    }
    handleAddComment(data, client) {
        if (!data.text?.trim() || !data.username?.trim())
            return;
        const comment = this.commentsService.add(data.username, data.text.trim());
        this.server.emit('new_comment', comment);
        client.broadcast.emit('comment_notification', {
            username: data.username,
            text: data.text.trim(),
        });
        console.log(`💬 New comment from ${data.username}: ${data.text}`);
    }
    broadcastOnlineCount() {
        this.server.emit('online_count', this.server.sockets.sockets.size);
    }
};
exports.CommentsGateway = CommentsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], CommentsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('set_username'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], CommentsGateway.prototype, "handleSetUsername", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('add_comment'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], CommentsGateway.prototype, "handleAddComment", null);
exports.CommentsGateway = CommentsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: ['http://localhost:3000', 'http://localhost:3001'],
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof comments_service_1.CommentsService !== "undefined" && comments_service_1.CommentsService) === "function" ? _a : Object])
], CommentsGateway);
//# sourceMappingURL=comments.gateway.js.map