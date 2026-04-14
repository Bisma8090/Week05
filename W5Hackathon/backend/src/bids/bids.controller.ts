import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { BidsService } from './bids.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('bids')
export class BidsController {
  constructor(private bidsService: BidsService) {}

  @Post(':carId')
  @UseGuards(JwtAuthGuard)
  placeBid(
    @Param('carId') carId: string,
    @Body('amount') amount: number,
    @Request() req: any,
  ) {
    return this.bidsService.placeBid(carId, amount, req.user._id);
  }

  @Get(':carId/top-bidders')
  getTopBidders(@Param('carId') carId: string) {
    return this.bidsService.getTopBidders(carId);
  }

  @Get('user/my-bids')
  @UseGuards(JwtAuthGuard)
  getUserBids(@Request() req: any) {
    return this.bidsService.getUserBids(req.user._id);
  }
}
