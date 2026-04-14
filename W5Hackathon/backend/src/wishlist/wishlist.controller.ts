import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wishlist')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getWishlist(@Request() req: any) {
    return this.wishlistService.getWishlist(req.user._id);
  }

  @Post('toggle/:carId')
  @UseGuards(JwtAuthGuard)
  toggle(@Param('carId') carId: string, @Request() req: any) {
    return this.wishlistService.toggle(req.user._id, carId);
  }

  @Get('check/:carId')
  @UseGuards(JwtAuthGuard)
  check(@Param('carId') carId: string, @Request() req: any) {
    return this.wishlistService.isWishlisted(req.user._id, carId);
  }
}
