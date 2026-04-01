import { Controller, Post, Delete, Get, Param, UseGuards, Request } from '@nestjs/common';
import { FollowersService } from './followers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('followers')
@UseGuards(JwtAuthGuard)
export class FollowersController {
  constructor(private followersService: FollowersService) {}

  @Post(':userId')
  follow(@Request() req, @Param('userId') userId: string) {
    return this.followersService.follow(req.user.userId, userId, req.user.username);
  }

  @Delete(':userId')
  unfollow(@Request() req, @Param('userId') userId: string) {
    return this.followersService.unfollow(req.user.userId, userId);
  }

  @Get(':userId/followers')
  getFollowers(@Param('userId') userId: string) {
    return this.followersService.getFollowers(userId);
  }

  @Get(':userId/following')
  getFollowing(@Param('userId') userId: string) {
    return this.followersService.getFollowing(userId);
  }
}
