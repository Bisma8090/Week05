import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

export enum ShippingStatus {
  READY = 'ready_for_shipping',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
}

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Car', required: true })
  car: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  buyer: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: ShippingStatus.READY, enum: ShippingStatus })
  shippingStatus: string;

  @Prop({ default: false })
  completed: boolean;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
