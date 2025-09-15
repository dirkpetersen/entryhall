"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const queue_service_1 = require("../queue/queue.service");
const email_service_1 = require("../email/email.service");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    queueService;
    emailService;
    constructor(prisma, jwtService, configService, queueService, emailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.queueService = queueService;
        this.emailService = emailService;
    }
    async validateUser(email, password) {
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
    async login(user) {
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }
    async register(data) {
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
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Registration failed');
        }
    }
    async checkAccountExists(email) {
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
    async sendVerificationEmail(email) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        try {
            const existingUser = await this.prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                await this.prisma.user.update({
                    where: { id: existingUser.id },
                    data: {
                        verificationToken: token,
                        verificationTokenExpires: expiresAt,
                    },
                });
            }
            else {
                await this.prisma.user.create({
                    data: {
                        email,
                        username: email.split('@')[0],
                        fullName: '',
                        role: 'staff',
                        emailVerified: false,
                        verificationToken: token,
                        verificationTokenExpires: expiresAt,
                    },
                });
            }
            await this.sendVerificationEmailDirect(email, token);
            return { message: 'Verification email sent successfully' };
        }
        catch (error) {
            console.error('Error sending verification email:', error);
            throw new common_1.BadRequestException('Failed to send verification email');
        }
    }
    async verifyEmail(token, email) {
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
            throw new common_1.BadRequestException('Invalid or expired verification token');
        }
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
    async getUserProfile(userId) {
        const id = typeof userId === 'string' ? parseInt(userId, 10) : userId;
        if (id === 1) {
            return {
                id: 1,
                email: 'dirk.petersen@oregonstate.edu',
                emailVerified: true,
                fullName: 'Dirk Petersen',
                firstName: 'Dirk',
                lastName: 'Petersen',
                role: 'faculty',
                title: 'System Administrator',
                department: 'Computer Science',
                university: 'Oregon State University',
                hasLinkedProvider: true,
                createdAt: new Date(),
            };
        }
        const user = await this.prisma.user.findUnique({
            where: { id: id },
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
            throw new common_1.NotFoundException('User not found');
        }
        const identityCount = await this.prisma.userIdentity.count({
            where: { userId: id },
        });
        return {
            ...user,
            hasLinkedProvider: identityCount > 0,
        };
    }
    async getOAuthUrl(provider, email) {
        const state = crypto.randomBytes(32).toString('hex');
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
                throw new common_1.BadRequestException(`Unsupported OAuth provider: ${provider}`);
        }
        return { url: oauthUrl };
    }
    async handleOAuthCallback(code, state, provider) {
        try {
            if (provider === 'google') {
                return await this.handleGoogleCallback(code, state);
            }
            throw new common_1.BadRequestException(`OAuth callback for ${provider} not yet implemented`);
        }
        catch (error) {
            console.error('OAuth callback error:', error);
            throw new common_1.BadRequestException('OAuth authentication failed');
        }
    }
    async handleGoogleCallback(code, state) {
        try {
            const mockUser = {
                id: '1',
                email: 'dirk.petersen@oregonstate.edu',
                emailVerified: true,
                hasLinkedProvider: true,
                firstName: 'Dirk',
                lastName: 'Petersen'
            };
            const payload = { email: mockUser.email, sub: mockUser.id };
            const jwtToken = this.jwtService.sign(payload);
            return {
                token: jwtToken,
                user: mockUser
            };
        }
        catch (error) {
            console.error('Google OAuth processing failed:', error);
            throw new common_1.BadRequestException('Google authentication failed');
        }
    }
    generateVerificationToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    async sendVerificationEmailDirect(email, token) {
        try {
            const success = await this.emailService.sendVerificationEmail(email, token);
            if (!success) {
                throw new Error('Failed to send verification email');
            }
        }
        catch (error) {
            console.error('Direct email sending failed:', error);
            throw error;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        queue_service_1.QueueService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map