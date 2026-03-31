import { Body, Controller, Post, Param } from '@nestjs/common';
import { CommentService } from './comment.service';

@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Post()
  create(@Body() body) {
    return this.commentService.createComment(body);
  }

  @Post('reply/:id')
  reply(@Param('id') id, @Body() body) {
    return this.commentService.reply(id, body);
  }
}