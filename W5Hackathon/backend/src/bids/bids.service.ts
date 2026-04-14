import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bid, BidDocument } from '../schemas/bid.schema';
import { Car, CarDocument } from '../schemas/car.schema';
import { BidsGateway } from './bids.gateway';

@Injectable()
export class BidsService {
  constructor(
    @InjectModel(Bid.name) private bidModel: Model<BidDocument>,
    @InjectModel(Car.name) private carModel: Model<CarDocument>,
    private bidsGateway: BidsGateway,
  ) {}

  async placeBid(carId: string, amount: number, bidderId: string) {
    const car = await this.carModel.findById(carId).populate('seller', 'name');
    if (!car) throw new BadRequestException('Car not found');
    if (car.status !== 'active') throw new BadRequestException('Auction is not active');

    // Server-side: user cannot bid on their own car
    if (car.seller._id.toString() === bidderId) {
      throw new ForbiddenException('You cannot bid on your own car');
    }

    if (amount <= car.currentBid) {
      throw new BadRequestException(`Bid must be higher than current bid of $${car.currentBid}`);
    }

    const bid = await this.bidModel.create({ car: carId, bidder: bidderId, amount });
    await this.carModel.findByIdAndUpdate(carId, { currentBid: amount, currentBidder: bidderId });

    const populated = await bid.populate('bidder', 'name email');

    this.bidsGateway.emitNewBid(carId, {
      _id: bid._id,
      amount,
      bidder: populated.bidder,
      carTitle: car.title,
      createdAt: (bid as any).createdAt,
    });

    return populated;
  }

  async getTopBidders(carId: string) {
    return this.bidModel
      .find({ car: carId })
      .populate('bidder', 'name email phone')
      .sort({ amount: -1 })
      .limit(10);
  }

  async getUserBids(userId: string) {
    return this.bidModel
      .find({ bidder: userId })
      .populate('car')
      .sort({ createdAt: -1 });
  }
}
