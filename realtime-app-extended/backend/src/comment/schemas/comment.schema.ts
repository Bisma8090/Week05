import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Comment {
  @Prop()
  content: string;

  @Prop()
  author: string;

  @Prop({ default: null })
  parentComment: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);