export interface Comment {
    id: string;
    username: string;
    text: string;
    timestamp: string;
    avatar: string;
}
export declare class CommentsService {
    private comments;
    getAll(): Comment[];
    add(username: string, text: string): Comment;
}
