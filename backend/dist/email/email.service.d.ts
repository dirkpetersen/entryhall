import { ConfigService } from '@nestjs/config';
export interface EmailTemplate {
    subject: string;
    htmlContent: string;
    textContent: string;
}
export declare class EmailService {
    private readonly configService;
    private readonly logger;
    private readonly sesClient;
    private readonly fromEmail;
    constructor(configService: ConfigService);
    sendEmail(to: string, subject: string, htmlContent: string, textContent?: string): Promise<boolean>;
    sendVerificationEmail(email: string, verificationToken: string): Promise<boolean>;
    sendWelcomeEmail(email: string, firstName?: string): Promise<boolean>;
    sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean>;
    private buildVerificationUrl;
    private buildPasswordResetUrl;
    private getVerificationEmailTemplate;
    private getWelcomeEmailTemplate;
    private getPasswordResetTemplate;
    private extractUniversityFromEmail;
}
