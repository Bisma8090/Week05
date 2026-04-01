import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { AppGateway } from '../gateway/app.gateway';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private notificationsService: NotificationsService,
    private gateway: AppGateway,
  ) {}

  async create(userId: string, dto: CreateCommentDto, username: string) {
  // 🔴 VALIDATE userId
  if (!Types.ObjectId.isValid(userId)) {
    throw new ForbiddenException('Invalid userId');
  }

  const commentData: any = {
    author: new Types.ObjectId(userId),
    content: dto.content,
    parentCommentId: dto.parentCommentId && Types.ObjectId.isValid(dto.parentCommentId)
      ? new Types.ObjectId(dto.parentCommentId)
      : null,
  };

  const comment = await this.commentModel.create(commentData);

  const populated = await comment.populate([
    { path: 'author', select: 'username profilePicture' },
    { path: 'parentCommentId', populate: { path: 'author', select: 'username' } },
  ]);

  

    if (dto.parentCommentId) {
      // Notify parent comment author of the reply
      const parent = await this.commentModel.findById(dto.parentCommentId);
      if (parent && parent.author.toString() !== userId) {
        const notif = await this.notificationsService.create({
          recipient: parent.author.toString(),
          sender: userId,
          type: NotificationType.NEW_REPLY,
          message: `${username} replied to your comment`,
          commentId: comment._id.toString(),
        });
        this.gateway.notifyReply(parent.author.toString(), { notification: notif });
      }
    }

    this.gateway.notifyNewComment({ comment: populated, username });
    return populated;
  }

  async findAll() {
    return this.commentModel
      .find()
      .populate('author', 'username profilePicture')
      .populate({ path: 'parentCommentId', populate: { path: 'author', select: 'username' } })
      .sort({ createdAt: -1 });
  }

  async delete(commentId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.author.toString() !== userId) throw new ForbiddenException();
    await this.commentModel.findByIdAndDelete(commentId);
    return { message: 'Deleted' };
  }
}
