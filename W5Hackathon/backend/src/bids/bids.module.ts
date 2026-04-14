import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { BidsController } from './bids.controller';
import { BidsService } from './bids.service';
import { BidsGateway } from './bids.gateway';
import { Bid, BidSchema } from '../schemas/bid.schema';
import { Car, CarSchema } from '../schemas/car.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bid.name, schema: BidSchema },
      { name: Car.name, schema: CarSchema },
    ]),
    PassportModule,
    AuthModule,
  ],
  controllers: [BidsController],
  providers: [BidsService, BidsGateway],
  exports: [BidsGateway],
})
export class BidsModule {}
