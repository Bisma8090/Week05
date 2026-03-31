import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentService {
  
  createComment(data: any) {
    return { message: 'Comment created', data };
  }

  reply(data: any) {
    return { message: 'Reply added', data };
  }
}