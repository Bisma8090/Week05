import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument, ShippingStatus } from '../schemas/payment.schema';
import { Car, CarDocument } from '../schemas/car.schema';
import { BidsGateway } from '../bids/bids.gateway';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Car.name) private carModel: Model<CarDocument>,
    private bidsGateway: BidsGateway,
  ) {}

  async makePayment(carId: string, buyerId: string) {
    const car = await this.carModel.findById(carId);
    if (!car) throw new BadRequestException('Car not found');
    if (car.status !== 'ended') throw new BadRequestException('Auction not ended yet');
    if (car.winner?.toString() !== buyerId.toString()) throw new BadRequestException('You are not the winner');

    const existing = await this.paymentModel.findOne({ car: carId, buyer: buyerId });
    if (existing) return existing;

    const payment = await this.paymentModel.create({
      car: carId,
      buyer: buyerId,
      amount: car.currentBid,
    });

    // Auto-progress shipping status
    this.scheduleShippingUpdates(payment._id.toString(), carId);

    return payment;
  }

  private scheduleShippingUpdates(paymentId: string, carId: string) {
    setTimeout(async () => {
      await this.paymentModel.findByIdAndUpdate(paymentId, { shippingStatus: ShippingStatus.IN_TRANSIT });
      this.bidsGateway.emitShippingUpdate(carId, ShippingStatus.IN_TRANSIT);
    }, 60000);

    setTimeout(async () => {
      await this.paymentModel.findByIdAndUpdate(paymentId, {
        shippingStatus: ShippingStatus.DELIVERED,
        completed: true,
      });
      await this.carModel.findByIdAndUpdate(carId, { status: 'completed' });
      this.bidsGateway.emitShippingUpdate(carId, ShippingStatus.DELIVERED);
    }, 120000);
  }

  async getPayment(carId: string, buyerId: string) {
    return this.paymentModel
      .findOne({ car: carId, buyer: buyerId })
      .populate('car')
      .populate('buyer', 'name email');
  }

  async getUserPayments(userId: string) {
    return this.paymentModel
      .find({ buyer: userId })
      .populate('car')
      .sort({ createdAt: -1 });
  }
}
