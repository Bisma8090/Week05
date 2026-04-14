import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getProfile(userId: string) {
    return this.userModel.findById(userId).select('-password');
  }

  async updateProfile(userId: string, data: Partial<User>) {
    return this.userModel.findByIdAndUpdate(userId, data, { new: true }).select('-password');
  }
}
