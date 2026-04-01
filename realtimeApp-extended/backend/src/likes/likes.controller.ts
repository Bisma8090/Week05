import { Controller, Post, Param, UseGuards, Request, Body } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikeType } from './schemas/like.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('likes')
export class LikesController {
  constructor(private likesService: LikesService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':commentId')
  toggle(
    @Request() req,
    @Param('commentId') commentId: string,
    @Body('type') type: LikeType = LikeType.LIKE,
  ) {
    return this.likesService.toggle(req.user.userId, commentId, type, req.user.username);
  }
}
