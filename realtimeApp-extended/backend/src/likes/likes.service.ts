import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Like, LikeDocument, LikeType } from './schemas/like.schema';
import { Comment, CommentDocument } from '../comments/schemas/comment.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { AppGateway } from '../gateway/app.gateway';

@Injectable()
export class LikesService {
  constructor(
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private notificationsService: NotificationsService,
    private gateway: AppGateway,
  ) {}

  async toggle(userId: string, commentId: string, type: LikeType, username: string) {
    const existing = await this.likeModel.findOne({
      user: new Types.ObjectId(userId),
      comment: new Types.ObjectId(commentId),
    });

    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new BadRequestException('Comment not found');

    if (existing) {
      if (existing.type === type) {
        // Remove the reaction
        await existing.deleteOne();
        const field = type === LikeType.LIKE ? 'likesCount' : 'dislikesCount';
        await this.commentModel.findByIdAndUpdate(commentId, { $inc: { [field]: -1 } });
        return { action: 'removed', type };
      } else {
        // Switch reaction
        const oldField = existing.type === LikeType.LIKE ? 'likesCount' : 'dislikesCount';
        const newField = type === LikeType.LIKE ? 'likesCount' : 'dislikesCount';
        existing.type = type;
        await existing.save();
        await this.commentModel.findByIdAndUpdate(commentId, {
          $inc: { [oldField]: -1, [newField]: 1 },
        });
        return { action: 'switched', type };
      }
    }

    // New reaction
    await this.likeModel.create({
      user: new Types.ObjectId(userId),
      comment: new Types.ObjectId(commentId),
      type,
    });
    const field = type === LikeType.LIKE ? 'likesCount' : 'dislikesCount';
    await this.commentModel.findByIdAndUpdate(commentId, { $inc: { [field]: 1 } });

    // Notify comment author if it's a like and not self
    if (type === LikeType.LIKE && comment.author.toString() !== userId) {
      const notif = await this.notificationsService.create({
        recipient: comment.author.toString(),
        sender: userId,
        type: NotificationType.NEW_LIKE,
        message: `${username} liked your comment`,
        commentId,
      });
      this.gateway.notifyLike(comment.author.toString(), { notification: notif });
    }

    return { action: 'added', type };
  }

  async getForComment(commentId: string, userId?: string) {
    const [likesCount, dislikesCount, userReaction] = await Promise.all([
      this.likeModel.countDocuments({ comment: new Types.ObjectId(commentId), type: LikeType.LIKE }),
      this.likeModel.countDocuments({ comment: new Types.ObjectId(commentId), type: LikeType.DISLIKE }),
      userId
        ? this.likeModel.findOne({ comment: new Types.ObjectId(commentId), user: new Types.ObjectId(userId) })
        : null,
    ]);
    return { likesCount, dislikesCount, userReaction: userReaction?.type || null };
  }
}
