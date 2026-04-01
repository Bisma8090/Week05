import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FollowerDocument = Follower & Document;

@Schema({ timestamps: true })
export class Follower {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  follower: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  following: Types.ObjectId;
}

export const FollowerSchema = SchemaFactory.createForClass(Follower);
FollowerSchema.index({ follower: 1, following: 1 }, { unique: true });
