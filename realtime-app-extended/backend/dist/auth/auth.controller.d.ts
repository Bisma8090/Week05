import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(body: any): Promise<import("mongoose").Document<unknown, {}, import("../user/schemas/user.schema").User, {}, import("mongoose").DefaultSchemaOptions> & import("../user/schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    login(body: any): Promise<{
        message: string;
        user: import("mongoose").Document<unknown, {}, import("../user/schemas/user.schema").User, {}, import("mongoose").DefaultSchemaOptions> & import("../user/schemas/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        };
    }>;
}
