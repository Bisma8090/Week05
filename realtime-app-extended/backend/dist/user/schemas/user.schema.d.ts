import { Document } from 'mongoose';
export type UserDocument = User & Document;
export declare class User {
    email: string;
    password: string;
}
export declare const UserSchema: any;
