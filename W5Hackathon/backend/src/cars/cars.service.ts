import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Car, CarDocument } from '../schemas/car.schema';
import { Bid, BidDocument } from '../schemas/bid.schema';
import { CreateCarDto } from './dto/create-car.dto';
import { BidsGateway } from '../bids/bids.gateway';

@Injectable()
export class CarsService {
  constructor(
    @InjectModel(Car.name) private carModel: Model<CarDocument>,
    @InjectModel(Bid.name) private bidModel: Model<BidDocument>,
    private bidsGateway: BidsGateway,
  ) {}

  async create(dto: CreateCarDto, sellerId: string, images: string[]) {
    const lotNumber = Math.floor(100000 + Math.random() * 900000);
    const car = await this.carModel.create({
      ...dto,
      year: Number(dto.year),
      startingPrice: Number(dto.startingPrice),
      mileage: dto.mileage ? Number(dto.mileage) : 0,
      seller: sellerId,
      images,
      currentBid: Number(dto.startingPrice),
      lotNumber,
    });
    this.bidsGateway.emitAuctionStarted(car);
    return car;
  }

  async findAll(query: any) {
    await this.autoEndExpiredAuctions();
    const filter: any = { status: 'active' };

    if (query.make) filter.make = new RegExp(query.make, 'i');
    if (query.model) filter.model = new RegExp(query.model, 'i');
    if (query.year) filter.year = Number(query.year);
    if (query.category) filter.category = query.category;
    if (query.minPrice || query.maxPrice) {
      filter.currentBid = {};
      if (query.minPrice) filter.currentBid.$gte = Number(query.minPrice);
      if (query.maxPrice) filter.currentBid.$lte = Number(query.maxPrice);
    }
    if (query.search) {
      filter.$or = [
        { title: new RegExp(query.search, 'i') },
        { make: new RegExp(query.search, 'i') },
        { model: new RegExp(query.search, 'i') },
      ];
    }

    return this.carModel.find(filter).populate('seller', 'name email').sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    const car = await this.carModel
      .findById(id)
      .populate('seller', 'name email phone')
      .populate('currentBidder', 'name email')
      .populate('winner', 'name email');
    if (!car) return null;
    const totalBids = await this.bidModel.countDocuments({ car: id });
    return { ...car.toObject(), totalBids };
  }

  async findByCategory(category: string) {
    return this.carModel.find({ category, status: 'active' }).populate('seller', 'name').sort({ createdAt: -1 }).limit(8);
  }

  async findBySeller(sellerId: string) {
    return this.carModel.find({ seller: sellerId }).sort({ createdAt: -1 });
  }

  async findRelated(carId: string, category: string) {
    return this.carModel
      .find({ _id: { $ne: carId }, category, status: 'active' })
      .limit(4)
      .populate('seller', 'name');
  }

  async updateBid(carId: string, amount: number, bidderId: string) {
    return this.carModel.findByIdAndUpdate(
      carId,
      { currentBid: amount, currentBidder: bidderId },
      { new: true },
    );
  }

  async endAuction(carId: string) {
    const car = await this.carModel.findById(carId);
    if (!car) return null;
    return this.carModel.findByIdAndUpdate(
      carId,
      { status: 'ended', winner: car.currentBidder },
      { new: true },
    );
  }

  async endAuctionBySeller(carId: string, sellerId: string) {
    const car = await this.carModel.findById(carId).populate('currentBidder', 'name email');
    if (!car) throw new Error('Car not found');
    if (!car.seller.equals(sellerId)) throw new Error('Not authorized');
    const winnerId = car.currentBidder ? (car.currentBidder as any)._id : null;
    const updated = await this.carModel.findByIdAndUpdate(
      carId,
      { status: 'ended', winner: winnerId },
      { new: true },
    );
    this.bidsGateway.emitAuctionEnded(carId, car.currentBidder, car.title);
    return updated;
  }

  async markCompleted(carId: string) {
    return this.carModel.findByIdAndUpdate(carId, { status: 'completed' }, { new: true });
  }

  async expireAuction(carId: string) {
    const car = await this.carModel
      .findOne({ _id: carId, status: 'active', auctionEndDate: { $lte: new Date() } })
      .populate('currentBidder', 'name email');
    if (!car) return { ok: false }; // already ended or not expired yet
    const winner = car.currentBidder as any;
    await this.carModel.findByIdAndUpdate(carId, {
      status: 'ended',
      winner: winner ? winner._id : null,
    });
    this.bidsGateway.emitAuctionEnded(carId, winner, car.title);
    return { ok: true };
  }

  async getLiveAuctions() {
    // Auto-end expired auctions
    await this.autoEndExpiredAuctions();
    return this.carModel
      .find({ status: 'active' })
      .populate('seller', 'name')
      .sort({ auctionEndDate: 1 })
      .limit(6);
  }

  async autoEndExpiredAuctions() {
    const expired = await this.carModel.find({
      status: 'active',
      auctionEndDate: { $lte: new Date() },
    }).populate('currentBidder', 'name email');
    for (const car of expired) {
      const winnerId = car.currentBidder ? (car.currentBidder as any)._id : null;
      await this.carModel.findByIdAndUpdate(car._id, {
        status: 'ended',
        winner: winnerId,
      });
      this.bidsGateway.emitAuctionEnded(
        car._id.toString(),
        car.currentBidder,
        car.title,
      );
    }
  }
}
