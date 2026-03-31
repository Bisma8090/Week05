import { CommentService } from './comment.service';
export declare class CommentController {
    private commentService;
    constructor(commentService: CommentService);
    create(body: any): {
        message: string;
        data: any;
    };
    reply(id: any, body: any): {
        message: string;
        data: any;
    };
}
