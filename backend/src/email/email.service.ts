import { Injectable, Logger } from '@nestjs/common';
import { SESClient, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-ses';
import { ConfigService } from '@nestjs/config';

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly sesClient: SESClient;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const awsRegion = this.configService.get('AWS_REGION', 'us-west-2');
    const awsAccessKey = this.configService.get('AWS_ACCESS_KEY_ID');
    const awsSecretKey = this.configService.get('AWS_SECRET_ACCESS_KEY');

    // Initialize AWS SES client
    const sesConfig: any = { region: awsRegion };
    
    // Only set credentials if they are provided, otherwise use AWS CLI credentials
    if (awsAccessKey && awsSecretKey) {
      sesConfig.credentials = {
        accessKeyId: awsAccessKey,
        secretAccessKey: awsSecretKey,
      };
    }
    
    this.sesClient = new SESClient(sesConfig);
    this.fromEmail = this.configService.get('EMAIL_FROM', 'woerk@example.edu');
  }

  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string,
  ): Promise<boolean> {
    try {
      const params: SendEmailCommandInput = {
        Source: this.fromEmail,
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: htmlContent,
              Charset: 'UTF-8',
            },
            ...(textContent && {
              Text: {
                Data: textContent,
                Charset: 'UTF-8',
              },
            }),
          },
        },
      };

      const command = new SendEmailCommand(params);
      const result = await this.sesClient.send(command);
      
      this.logger.log(`Email sent successfully to ${to}. MessageId: ${result.MessageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      return false;
    }
  }

  async sendVerificationEmail(email: string, verificationToken: string): Promise<boolean> {
    const verificationUrl = this.buildVerificationUrl(verificationToken, email);
    const template = this.getVerificationEmailTemplate(email, verificationUrl);
    
    return this.sendEmail(
      email,
      template.subject,
      template.htmlContent,
      template.textContent,
    );
  }

  async sendWelcomeEmail(email: string, firstName?: string): Promise<boolean> {
    const template = this.getWelcomeEmailTemplate(firstName || 'User');
    
    return this.sendEmail(
      email,
      template.subject,
      template.htmlContent,
      template.textContent,
    );
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = this.buildPasswordResetUrl(resetToken, email);
    const template = this.getPasswordResetTemplate(email, resetUrl);
    
    return this.sendEmail(
      email,
      template.subject,
      template.htmlContent,
      template.textContent,
    );
  }

  private buildVerificationUrl(token: string, email: string): string {
    const baseUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3020');
    return `${baseUrl}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;
  }

  private buildPasswordResetUrl(token: string, email: string): string {
    const baseUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3020');
    return `${baseUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  }

  private getVerificationEmailTemplate(email: string, verificationUrl: string): EmailTemplate {
    const university = this.extractUniversityFromEmail(email);
    
    return {
      subject: 'Verify Your Woerk Account',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Woerk Account</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1f2937; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; }
            .button:hover { background: #1d4ed8; }
            .university { color: #059669; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Woerk</h1>
              <p>Supercomputer Resource Management</p>
            </div>
            <div class="content">
              <h2>Verify Your University Email</h2>
              <p>Welcome to Woerk! We need to verify your <span class="university">${university}</span> email address to complete your account setup.</p>
              
              <p>Your email address: <strong>${email}</strong></p>
              
              <p>Click the button below to verify your email and continue setting up your account:</p>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </p>
              
              <p>After verification, you'll be able to:</p>
              <ul>
                <li>Link your authentication provider (Google, GitHub, ORCID, LinkedIn)</li>
                <li>Access supercomputer resources</li>
                <li>Manage projects and allocations</li>
                <li>Collaborate with research teams</li>
              </ul>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              
              <p><strong>Security Notice:</strong></p>
              <ul>
                <li>This verification link will expire in 24 hours</li>
                <li>Only use this link if you requested a Woerk account</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
            <div class="footer">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                This email was sent by Woerk Resource Management System<br>
                If you have questions, contact your system administrator
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Woerk - Verify Your University Email
        
        Welcome to Woerk! We need to verify your ${university} email address to complete your account setup.
        
        Your email address: ${email}
        
        Please click the link below to verify your email and continue:
        ${verificationUrl}
        
        After verification, you'll be able to:
        - Link your authentication provider (Google, GitHub, ORCID, LinkedIn)
        - Access supercomputer resources
        - Manage projects and allocations
        - Collaborate with research teams
        
        Security Notice:
        - This verification link will expire in 24 hours
        - Only use this link if you requested a Woerk account
        - If you didn't request this, please ignore this email
        
        ---
        This email was sent by Woerk Resource Management System
        If you have questions, contact your system administrator
      `,
    };
  }

  private getWelcomeEmailTemplate(firstName: string): EmailTemplate {
    return {
      subject: 'Welcome to Woerk!',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Woerk</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Woerk!</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName}!</h2>
              <p>Your Woerk account has been successfully set up. You now have access to our supercomputer resource management platform.</p>
              
              <h3>What you can do now:</h3>
              <ul>
                <li><strong>Create Projects:</strong> Set up new research projects with automatic Woerk ID generation</li>
                <li><strong>Manage Resources:</strong> Request and track compute, storage, and GPU allocations</li>
                <li><strong>Terminal Access:</strong> Connect directly to the supercomputer via web terminal</li>
                <li><strong>File Management:</strong> Upload and manage research data securely</li>
                <li><strong>Team Collaboration:</strong> Share resources and manage group access</li>
              </ul>
              
              <p>Get started by logging in to your Woerk dashboard and exploring the available features.</p>
            </div>
            <div class="footer">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                Happy researching!<br>
                The Woerk Team
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Welcome to Woerk!
        
        Hello ${firstName}!
        
        Your Woerk account has been successfully set up. You now have access to our supercomputer resource management platform.
        
        What you can do now:
        - Create Projects: Set up new research projects with automatic Woerk ID generation
        - Manage Resources: Request and track compute, storage, and GPU allocations
        - Terminal Access: Connect directly to the supercomputer via web terminal
        - File Management: Upload and manage research data securely
        - Team Collaboration: Share resources and manage group access
        
        Get started by logging in to your Woerk dashboard and exploring the available features.
        
        Happy researching!
        The Woerk Team
      `,
    };
  }

  private getPasswordResetTemplate(email: string, resetUrl: string): EmailTemplate {
    return {
      subject: 'Reset Your Woerk Password',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Woerk Password</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; }
            .button:hover { background: #b91c1c; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Password Reset</h1>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>A password reset was requested for your Woerk account: <strong>${email}</strong></p>
              
              <p>Click the button below to reset your password:</p>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              
              <p><strong>Important:</strong></p>
              <ul>
                <li>This reset link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password will remain unchanged until you complete the reset</li>
              </ul>
            </div>
            <div class="footer">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                If you're having trouble, contact your system administrator
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Woerk - Reset Your Password
        
        A password reset was requested for your Woerk account: ${email}
        
        Click the link below to reset your password:
        ${resetUrl}
        
        Important:
        - This reset link will expire in 1 hour
        - If you didn't request this reset, please ignore this email
        - Your password will remain unchanged until you complete the reset
        
        If you're having trouble, contact your system administrator
      `,
    };
  }

  private extractUniversityFromEmail(email: string): string {
    const domain = email.split('@')[1];
    if (domain.endsWith('.edu')) {
      const universityPart = domain.replace('.edu', '').split('.').pop();
      if (universityPart) {
        return universityPart.charAt(0).toUpperCase() + universityPart.slice(1) + ' University';
      }
    }
    return domain;
  }
}