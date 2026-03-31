"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
let CommentsService = class CommentsService {
    constructor() {
        this.comments = [
            {
                id: '1',
                username: 'Alice',
                text: 'Welcome to the real-time comment system! 🎉',
                timestamp: new Date().toISOString(),
                avatar: 'A',
            },
        ];
    }
    getAll() {
        return this.comments;
    }
    add(username, text) {
        const comment = {
            id: Date.now().toString(),
            username,
            text,
            timestamp: new Date().toISOString(),
            avatar: username.charAt(0).toUpperCase(),
        };
        this.comments.push(comment);
        return comment;
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)()
], CommentsService);
//# sourceMappingURL=comments.service.js.map