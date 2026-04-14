import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CarDocument = Car & Document;

export enum CarStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
  COMPLETED = 'completed',
}

@Schema({ timestamps: true })
export class Car {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  make: string;

  @Prop({ required: true })
  model: string;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  category: string; // sedan, sports, hatchback, convertible, suv, truck

  @Prop({ required: true })
  startingPrice: number;

  @Prop({ default: 0 })
  currentBid: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  seller: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  currentBidder: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  winner: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ required: true })
  auctionEndDate: Date;

  @Prop({ default: CarStatus.ACTIVE, enum: CarStatus })
  status: string;

  @Prop({ default: 0 })
  mileage: number;

  @Prop({ default: '' })
  color: string;

  @Prop({ default: '' })
  transmission: string;

  @Prop({ default: '' })
  fuelType: string;

  @Prop({ default: 0 })
  lotNumber: number;

  @Prop({ default: '' })
  vin: string;

  @Prop({ default: '' })
  engineSize: string;

  @Prop({ default: '' })
  hasGccSpecs: string;

  @Prop({ default: '' })
  features: string;

  @Prop({ default: '' })
  accidentHistory: string;

  @Prop({ default: '' })
  serviceHistory: string;

  @Prop({ default: 'stock' })
  isModified: string;

  @Prop({ default: 'private' })
  partyType: string;
}

export const CarSchema = SchemaFactory.createForClass(Car);
