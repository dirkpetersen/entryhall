import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any): Promise<{
        access_token: string;
        user: any;
    }>;
    register(body: {
        email: string;
        password: string;
        fullName: string;
        username: string;
    }): Promise<{
        access_token: string;
        user: any;
    }>;
    getProfile(req: any): any;
}
