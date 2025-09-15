import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { EmailService } from '../email/email.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    private queueService;
    private emailService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, queueService: QueueService, emailService: EmailService);
    validateUser(email: string, password: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        user: any;
    }>;
    register(data: {
        email: string;
        password: string;
        fullName: string;
        username: string;
    }): Promise<{
        access_token: string;
        user: any;
    }>;
    checkAccountExists(email: string): Promise<{
        exists: boolean;
        user?: any;
    }>;
    sendVerificationEmail(email: string): Promise<{
        message: string;
    }>;
    verifyEmail(token: string, email: string): Promise<{
        message: string;
    }>;
    getUserProfile(userId: string | number): Promise<any>;
    getOAuthUrl(provider: string, email?: string): Promise<{
        url: string;
    }>;
    handleOAuthCallback(code: string, state: string, provider: string): Promise<{
        token: string;
        user: any;
    }>;
    private handleGoogleCallback;
    private generateVerificationToken;
    private sendVerificationEmailDirect;
}
