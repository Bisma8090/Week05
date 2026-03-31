export declare class CommentService {
    createComment(body: any): {
        message: string;
        body: any;
    };
    reply(id: any, body: any): {
        message: string;
        id: any;
        body: any;
    };
}
