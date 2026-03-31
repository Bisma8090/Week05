import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/schemas/user.schema';
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async register(data) {
    const hashed = await bcrypt.hash(data.password, 10);
    return this.userModel.create({ ...data, password: hashed });
  }

  async login(data) {
    const user = await this.userModel.findOne({ email: data.email });
    if (!user) throw new Error('User not found');

    const match = await bcrypt.compare(data.password, user.password);
    if (!match) throw new Error('Wrong password');

    return { message: 'Login success', user };
  }
}