import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
export interface EmailJob {
    type: 'verification' | 'welcome' | 'password-reset';
    to: string;
    data: {
        token?: string;
        firstName?: string;
    };
}
export declare class QueueService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly emailService;
    private readonly logger;
    private boss;
    constructor(configService: ConfigService, emailService: EmailService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private setupJobHandlers;
    queueVerificationEmail(email: string, token: string): Promise<string | null>;
    queueWelcomeEmail(email: string, firstName?: string): Promise<string | null>;
    queuePasswordResetEmail(email: string, token: string): Promise<string | null>;
    private handleEmailJob;
    private handleCleanupJob;
    getQueueHealth(): Promise<{
        isHealthy: boolean;
        activeJobs: number;
    }>;
    retryFailedJobs(): Promise<number>;
}
