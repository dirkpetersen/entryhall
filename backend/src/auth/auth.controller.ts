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

  @ApiOperation({ summary: 'Verify email address' })
  @Post('verify-email')
  async verifyEmail(@Body() body: { token: string; email: string }) {
    const { token, email } = body;
    
    if (!token || !email) {
      throw new BadRequestException('Token and email are required');
    }

    return this.authService.verifyEmail(token, email);
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

  @ApiOperation({ summary: 'Initiate OAuth flow' })
  @Get(':provider')
  async initiateOAuth(@Request() req: any) {
    const provider = req.params.provider;
    const email = req.query.email;
    
    const supportedProviders = ['google', 'github', 'orcid', 'linkedin'];
    if (!supportedProviders.includes(provider)) {
      throw new BadRequestException(`Unsupported provider: ${provider}`);
    }

    return this.authService.getOAuthUrl(provider, email);
  }
}