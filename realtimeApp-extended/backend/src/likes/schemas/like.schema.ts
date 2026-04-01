import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LikeDocument = Like & Document;

export enum LikeType {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

@Schema({ timestamps: true })
export class Like {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Comment', required: true })
  comment: Types.ObjectId;

  @Prop({ enum: LikeType, default: LikeType.LIKE })
  type: LikeType;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
LikeSchema.index({ user: 1, comment: 1 }, { unique: true });
