import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: '' })
  address: string;

  @Prop({ default: '' })
  nationality: string;

  @Prop({ default: '' })
  idType: string;

  @Prop({ default: '' })
  idNumber: string;

  @Prop({ default: '' })
  avatar: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
