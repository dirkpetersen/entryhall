import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    checkAccount(body: {
        email: string;
    }): Promise<{
        exists: boolean;
        user?: any;
    }>;
    sendVerification(body: {
        email: string;
    }): Promise<{
        message: string;
    }>;
    verifyEmail(body: {
        token: string;
        email: string;
    }): Promise<{
        message: string;
    }>;
    oauthCallback(body: {
        code: string;
        state: string;
        provider: string;
    }): Promise<{
        token: string;
        user: any;
    }>;
    getProfile(req: any): Promise<any>;
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
    initiateOAuth(req: any): Promise<{
        url: string;
    }>;
}
