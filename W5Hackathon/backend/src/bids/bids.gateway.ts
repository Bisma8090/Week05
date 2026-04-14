import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Car, CarDocument } from '../schemas/car.schema';

@WebSocketGateway({ cors: { origin: 'http://localhost:3000', credentials: true } })
export class BidsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private auctionCheckInterval: NodeJS.Timeout;

  constructor(
    @InjectModel(Car.name) private carModel: Model<CarDocument>,
  ) {}

  afterInit() {
    console.log('WebSocket Gateway initialized');
    // Start interval AFTER server is ready — guaranteed this.server is set
    this.auctionCheckInterval = setInterval(() => {
      this.checkAndEndExpiredAuctions().catch((e) =>
        console.error('Auction check error:', e),
      );
    }, 2000);
  }

  onModuleDestroy() {
    clearInterval(this.auctionCheckInterval);
  }

  private async checkAndEndExpiredAuctions() {
    const expired = await this.carModel
      .find({ status: 'active', auctionEndDate: { $lte: new Date() } })
      .populate('currentBidder', 'name email');

    for (const car of expired) {
      const winner = car.currentBidder as any;
      const winnerId = winner ? winner._id : null;

      await this.carModel.findByIdAndUpdate(car._id, {
        status: 'ended',
        winner: winnerId,
      });

      console.log(`[Auction Ended] ${car.title} | Winner: ${winner?.name || 'none'}`);
      this.emitAuctionEnded(car._id.toString(), winner, car.title);
    }
  }

  @SubscribeMessage('joinAuction')
  handleJoin(@MessageBody() carId: string, @ConnectedSocket() client: Socket) {
    client.join(`auction:${carId}`);
  }

  @SubscribeMessage('leaveAuction')
  handleLeave(@MessageBody() carId: string, @ConnectedSocket() client: Socket) {
    client.leave(`auction:${carId}`);
  }

  @SubscribeMessage('joinUserRoom')
  handleJoinUserRoom(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    client.join(`user:${userId}`);
  }

  emitNewBid(carId: string, bidData: any) {
    this.server.to(`auction:${carId}`).emit('newBid', bidData);
    this.server.emit('notification', {
      type: 'NEW_BID',
      message: `New bid of $${bidData.amount} placed on ${bidData.carTitle}`,
      carId,
    });
  }

  emitAuctionStarted(car: any) {
    this.server.emit('notification', {
      type: 'BID_START',
      message: `New auction started: ${car.title}`,
      carId: car._id,
    });
  }

  emitAuctionEnded(carId: string, winner: any, carTitle: string) {
    this.server.to(`auction:${carId}`).emit('auctionEnded', { carId, winner, carTitle });

    this.server.emit('notification', {
      type: 'BID_ENDED',
      message: winner
        ? `Auction ended: ${carTitle} — Winner: ${winner.name}`
        : `Auction ended: ${carTitle} — No bids placed`,
      carId,
    });

    if (winner) {
      const winnerId = winner._id?.toString() || winner.toString();
      this.server.to(`user:${winnerId}`).emit('notification', {
        type: 'BID_WINNER',
        message: `🏆 Congratulations! You won the auction for ${carTitle}!`,
        carId,
        isWinner: true,
      });
    }
  }

  emitShippingUpdate(carId: string, status: string) {
    this.server.to(`auction:${carId}`).emit('shippingUpdate', { carId, status });
  }
}
