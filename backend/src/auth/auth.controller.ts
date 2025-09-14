import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Check if account exists for email' })
  @Post('check-account')
  async checkAccount(@Body() body: { email: string }) {
    const { email } = body;
    
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Valid email is required');
    }

    // Validate .edu domain
    if (!email.endsWith('.edu')) {
      throw new BadRequestException('Only university email addresses (.edu) are accepted');
    }

    return this.authService.checkAccountExists(email);
  }

  @ApiOperation({ summary: 'Send email verification' })
  @Post('send-verification')
  async sendVerification(@Body() body: { email: string }) {
    const { email } = body;
    
    if (!email || !email.endsWith('.edu')) {
      throw new BadRequestException('Valid university email (.edu) is required');
    }

    return this.authService.sendVerificationEmail(email);
  }

  @ApiOperation({ summary: 'Verify email address via POST' })
  @Post('verify-email')
  async verifyEmailPost(@Body() body: { token: string; email: string }) {
    const { token, email } = body;
    
    if (!token || !email) {
      throw new BadRequestException('Token and email are required');
    }

    return this.authService.verifyEmail(token, email);
  }

  @ApiOperation({ summary: 'Verify email address via GET (from email link)' })
  @Get('verify')
  async verifyEmailGet(@Request() req: any) {
    const { token, email } = req.query;
    
    if (!token || !email) {
      throw new BadRequestException('Token and email are required in query params');
    }

    try {
      const result = await this.authService.verifyEmail(token, email);
      
      // Redirect to frontend with verification success
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3020';
      const redirectUrl = `${frontendUrl}?email=${encodeURIComponent(email)}&verified=true`;
      
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Email Verified - Woerk</title>
          <meta http-equiv="refresh" content="3;url=${redirectUrl}">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f9fafb; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .success { color: #059669; font-size: 24px; margin-bottom: 20px; }
            .message { color: #374151; margin-bottom: 30px; line-height: 1.6; }
            .spinner { width: 20px; height: 20px; border: 2px solid #e5e7eb; border-top: 2px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite; display: inline-block; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Woerk</h1>
            <div class="success">✅ Email Verified Successfully!</div>
            <div class="message">
              Your university email <strong>${email}</strong> has been confirmed.<br>
              You will be redirected to complete your account setup...
            </div>
            <div class="spinner"></div>
            <p><small>Redirecting in 3 seconds... <br>If not redirected, <a href="${redirectUrl}">click here</a></small></p>
          </div>
        </body>
        </html>
      `;
    } catch (error) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Verification Failed - Woerk</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f9fafb; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #dc2626; font-size: 24px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Woerk</h1>
            <div class="error">❌ Verification Failed</div>
            <p>The verification link is invalid or has expired.</p>
            <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3020'}">Return to Woerk</a></p>
          </div>
        </body>
        </html>
      `;
    }
  }

  @ApiOperation({ summary: 'OAuth callback handler' })
  @Post('callback')
  async oauthCallback(@Body() body: { 
    code: string; 
    state: string; 
    provider: string;
  }) {
    const { code, state, provider } = body;
    
    if (!code || !state || !provider) {
      throw new BadRequestException('Code, state, and provider are required');
    }

    return this.authService.handleOAuthCallback(code, state, provider);
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req: any) {
    return this.authService.getUserProfile(req.user.id);
  }

  @ApiOperation({ summary: 'Initiate OAuth flow' })
  @Get('oauth/:provider')
  async initiateOAuth(@Request() req: any) {
    const provider = req.params.provider;
    const email = req.query.email;
    
    const supportedProviders = ['google', 'github', 'orcid', 'linkedin'];
    if (!supportedProviders.includes(provider)) {
      throw new BadRequestException(`Unsupported provider: ${provider}`);
    }

    return this.authService.getOAuthUrl(provider, email);
  }

  @ApiOperation({ summary: 'User login (legacy)' })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @ApiOperation({ summary: 'User registration (legacy)' })
  @Post('register')
  async register(
    @Body()
    body: {
      email: string;
      password: string;
      fullName: string;
      username: string;
    },
  ) {
    return this.authService.register(body);
  }
}