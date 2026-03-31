import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentsModule } from './comment/comments.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CommentModule } from './comment/comment.module';
import { NotificationModule } from './notification/notification.module';
import { FollowersModule } from './followers/followers.module';
import { LikesModule } from './likes/likes.module';
import { WebsocketGateway } from './websocket/websocket.gateway';

@Module({
  imports: [CommentsModule,
  MongooseModule.forRoot('mongodb://127.0.0.1:27017/comment-system'),
  AuthModule,
  UserModule,
  CommentModule,
  NotificationModule,
  FollowersModule,
  LikesModule],
  providers: [WebsocketGateway],
})
export class AppModule {}