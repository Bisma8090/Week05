import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './schemas/comment.schema';

import { WebsocketGateway } from '../websocket/websocket.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  controllers: [CommentController],
  providers: [CommentService, WebsocketGateway],
})
export class CommentModule {}