import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notifModel: Model<NotificationDocument>,
  ) {}

  async create(data: {
    recipient: string;
    sender: string;
    type: NotificationType;
    message: string;
    commentId?: string;
  }): Promise<NotificationDocument> {
    return this.notifModel.create({
      recipient: new Types.ObjectId(data.recipient),
      sender: new Types.ObjectId(data.sender),
      type: data.type,
      message: data.message,
      commentId: data.commentId ? new Types.ObjectId(data.commentId) : undefined,
    });
  }

  async getForUser(userId: string) {
    return this.notifModel
      .find({ recipient: new Types.ObjectId(userId) })
      .populate('sender', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(50);
  }

  async markAllRead(userId: string) {
    await this.notifModel.updateMany(
      { recipient: new Types.ObjectId(userId), read: false },
      { read: true },
    );
    return { message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notifModel.countDocuments({
      recipient: new Types.ObjectId(userId),
      read: false,
    });
  }
}
