import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private queueService: QueueService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && user.passwordHash) {
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (isValid) {
        const { passwordHash, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(data: {
    email: string;
    password: string;
    fullName: string;
    username: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    try {
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          passwordHash: hashedPassword,
          fullName: data.fullName,
          username: data.username,
        },
      });

      const { passwordHash, ...result } = user;
      return this.login(result);
    } catch (error) {
      throw new UnauthorizedException('Registration failed');
    }
  }

  async checkAccountExists(email: string): Promise<{ exists: boolean; user?: any }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    if (user) {
      // Check if user has linked any identity providers
      const identityCount = await this.prisma.userIdentity.count({
        where: { userId: user.id },
      });

      return {
        exists: true,
        user: {
          ...user,
          hasLinkedProvider: identityCount > 0,
        },
      };
    }

    return { exists: false };
  }

  async sendVerificationEmail(email: string): Promise<{ message: string }> {
    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    try {
      // Store or update verification token
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // Update existing user's verification token
        await this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            verificationToken: token,
            verificationTokenExpires: expiresAt,
          },
        });
      } else {
        // Create new user record with verification token
        await this.prisma.user.create({
          data: {
            email,
            username: email.split('@')[0], // Temporary username
            fullName: '', // Will be filled during setup
            role: 'staff', // Default role
            emailVerified: false,
            verificationToken: token,
            verificationTokenExpires: expiresAt,
          },
        });
      }

      // Send verification email directly (bypassing queue for now)
      await this.sendVerificationEmailDirect(email, token);

      return { message: 'Verification email sent successfully' };
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new BadRequestException('Failed to send verification email');
    }
  }

  async verifyEmail(token: string, email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        verificationToken: token,
        verificationTokenExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Mark email as verified and clear verification token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  async getUserProfile(userId: number): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        fullName: true,
        firstName: true,
        lastName: true,
        role: true,
        title: true,
        department: true,
        university: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has linked providers
    const identityCount = await this.prisma.userIdentity.count({
      where: { userId: userId },
    });

    return {
      ...user,
      hasLinkedProvider: identityCount > 0,
    };
  }

  async getOAuthUrl(provider: string, email?: string): Promise<{ url: string }> {
    // Generate state parameter for OAuth security
    const state = crypto.randomBytes(32).toString('hex');
    
    // Store state and email in session/cache (simplified for now)
    // In production, you'd store this securely
    
    let oauthUrl = '';
    const redirectUri = `${this.configService.get('FRONTEND_URL', 'http://localhost:3020')}/auth/callback`;
    
    switch (provider) {
      case 'google':
        const googleClientId = this.configService.get('GOOGLE_CLIENT_ID');
        oauthUrl = `https://accounts.google.com/o/oauth2/auth?` +
          `client_id=${googleClientId}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `scope=openid email profile&` +
          `response_type=code&` +
          `state=${state}`;
        break;
        
      case 'github':
        const githubClientId = this.configService.get('GITHUB_CLIENT_ID');
        oauthUrl = `https://github.com/login/oauth/authorize?` +
          `client_id=${githubClientId}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `scope=user:email&` +
          `state=${state}`;
        break;
        
      case 'orcid':
        const orcidClientId = this.configService.get('ORCID_CLIENT_ID');
        const orcidEnvironment = this.configService.get('ORCID_ENVIRONMENT', 'sandbox');
        const orcidDomain = orcidEnvironment === 'production' ? 'orcid.org' : 'sandbox.orcid.org';
        oauthUrl = `https://${orcidDomain}/oauth/authorize?` +
          `client_id=${orcidClientId}&` +
          `response_type=code&` +
          `scope=/authenticate&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `state=${state}`;
        break;
        
      case 'linkedin':
        const linkedinClientId = this.configService.get('LINKEDIN_CLIENT_ID');
        oauthUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
          `response_type=code&` +
          `client_id=${linkedinClientId}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `scope=r_liteprofile r_emailaddress&` +
          `state=${state}`;
        break;
        
      default:
        throw new BadRequestException(`Unsupported OAuth provider: ${provider}`);
    }

    return { url: oauthUrl };
  }

  async handleOAuthCallback(code: string, state: string, provider: string): Promise<{ token: string; user: any }> {
    // This is a simplified implementation
    // In production, you'd:
    // 1. Validate the state parameter
    // 2. Exchange code for access token
    // 3. Fetch user info from provider
    // 4. Link or create user account
    // 5. Generate JWT token
    
    // For now, return a mock response
    throw new BadRequestException('OAuth callback not yet implemented');
  }

  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private async sendVerificationEmailDirect(email: string, token: string): Promise<void> {
    try {
      const success = await this.emailService.sendVerificationEmail(email, token);
      if (!success) {
        throw new Error('Failed to send verification email');
      }
    } catch (error) {
      console.error('Direct email sending failed:', error);
      throw error;
    }
  }
}