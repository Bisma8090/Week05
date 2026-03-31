import { Injectable } from '@nestjs/common';

export interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
  avatar: string;
}

@Injectable()
export class CommentsService {
  // In-memory store
  private comments: Comment[] = [
    {
      id: '1',
      username: 'Alice',
      text: 'Welcome to the real-time comment system! 🎉',
      timestamp: new Date().toISOString(),
      avatar: 'A',
    },
  ];

  getAll(): Comment[] {
    return this.comments;
  }

  add(username: string, text: string): Comment {
    const comment: Comment = {
      id: Date.now().toString(),
      username,
      text,
      timestamp: new Date().toISOString(),
      avatar: username.charAt(0).toUpperCase(),
    };
    this.comments.push(comment);
    return comment;
  }
}