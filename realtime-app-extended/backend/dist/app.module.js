"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const comments_module_1 = require("./comment/comments.module");
const auth_module_1 = require("./auth/auth.module");
const user_module_1 = require("./user/user.module");
const comment_module_1 = require("./comment/comment.module");
const notification_module_1 = require("./notification/notification.module");
const followers_module_1 = require("./followers/followers.module");
const likes_module_1 = require("./likes/likes.module");
const websocket_gateway_1 = require("./websocket/websocket.gateway");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [comments_module_1.CommentsModule,
            mongoose_1.MongooseModule.forRoot('mongodb://127.0.0.1:27017/comment-system'),
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            comment_module_1.CommentModule,
            notification_module_1.NotificationModule,
            followers_module_1.FollowersModule,
            likes_module_1.LikesModule],
        providers: [websocket_gateway_1.WebsocketGateway],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map