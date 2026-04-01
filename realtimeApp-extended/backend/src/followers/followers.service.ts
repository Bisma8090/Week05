import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Follower, FollowerDocument } from './schemas/follower.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { AppGateway } from '../gateway/app.gateway';

@Injectable()
export class FollowersService {
  constructor(
    @InjectModel(Follower.name) private followerModel: Model<FollowerDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private notificationsService: NotificationsService,
    private gateway: AppGateway,
  ) {}

  async follow(followerId: string, followingId: string, followerUsername: string) {
    if (followerId === followingId) throw new BadRequestException('Cannot follow yourself');
    try {
      await this.followerModel.create({
        follower: new Types.ObjectId(followerId),
        following: new Types.ObjectId(followingId),
      });
      await this.userModel.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } });
      await this.userModel.findByIdAndUpdate(followingId, { $inc: { followersCount: 1 } });

      // Notify the followed user
      const notif = await this.notificationsService.create({
        recipient: followingId,
        sender: followerId,
        type: NotificationType.NEW_FOLLOWER,
        message: `${followerUsername} followed you`,
      });
      this.gateway.notifyFollow(followingId, { notification: notif });

      return { message: 'Followed successfully' };
    } catch {
      throw new BadRequestException('Already following');
    }
  }

  async unfollow(followerId: string, followingId: string) {
    const result = await this.followerModel.findOneAndDelete({
      follower: new Types.ObjectId(followerId),
      following: new Types.ObjectId(followingId),
    });
    if (!result) throw new BadRequestException('Not following');
    await this.userModel.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } });
    await this.userModel.findByIdAndUpdate(followingId, { $inc: { followersCount: -1 } });
    return { message: 'Unfollowed successfully' };
  }

  async getFollowers(userId: string) {
    return this.followerModel
      .find({ following: new Types.ObjectId(userId) })
      .populate('follower', '-password');
  }

  async getFollowing(userId: string) {
    return this.followerModel
      .find({ follower: new Types.ObjectId(userId) })
      .populate('following', '-password');
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const doc = await this.followerModel.findOne({
      follower: new Types.ObjectId(followerId),
      following: new Types.ObjectId(followingId),
    });
    return !!doc;
  }
}
