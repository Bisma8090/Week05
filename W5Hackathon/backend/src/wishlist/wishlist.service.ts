import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Wishlist, WishlistDocument } from '../schemas/wishlist.schema';

@Injectable()
export class WishlistService {
  constructor(@InjectModel(Wishlist.name) private wishlistModel: Model<WishlistDocument>) {}

  async getWishlist(userId: string) {
    return this.wishlistModel.find({ user: userId }).populate('car');
  }

  async toggle(userId: string, carId: string) {
    const existing = await this.wishlistModel.findOne({ user: userId, car: carId });
    if (existing) {
      await this.wishlistModel.deleteOne({ _id: existing._id });
      return { added: false };
    }
    await this.wishlistModel.create({ user: userId, car: carId });
    return { added: true };
  }

  async isWishlisted(userId: string, carId: string) {
    const item = await this.wishlistModel.findOne({ user: userId, car: carId });
    return { wishlisted: !!item };
  }
}
