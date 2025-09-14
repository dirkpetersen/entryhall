"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const local_auth_guard_1 = require("./local-auth.guard");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async checkAccount(body) {
        const { email } = body;
        if (!email || !email.includes('@')) {
            throw new common_1.BadRequestException('Valid email is required');
        }
        if (!email.endsWith('.edu')) {
            throw new common_1.BadRequestException('Only university email addresses (.edu) are accepted');
        }
        return this.authService.checkAccountExists(email);
    }
    async sendVerification(body) {
        const { email } = body;
        if (!email || !email.endsWith('.edu')) {
            throw new common_1.BadRequestException('Valid university email (.edu) is required');
        }
        return this.authService.sendVerificationEmail(email);
    }
    async verifyEmail(body) {
        const { token, email } = body;
        if (!token || !email) {
            throw new common_1.BadRequestException('Token and email are required');
        }
        return this.authService.verifyEmail(token, email);
    }
    async oauthCallback(body) {
        const { code, state, provider } = body;
        if (!code || !state || !provider) {
            throw new common_1.BadRequestException('Code, state, and provider are required');
        }
        return this.authService.handleOAuthCallback(code, state, provider);
    }
    async getProfile(req) {
        return this.authService.getUserProfile(req.user.id);
    }
    async login(req) {
        return this.authService.login(req.user);
    }
    async register(body) {
        return this.authService.register(body);
    }
    async initiateOAuth(req) {
        const provider = req.params.provider;
        const email = req.query.email;
        const supportedProviders = ['google', 'github', 'orcid', 'linkedin'];
        if (!supportedProviders.includes(provider)) {
            throw new common_1.BadRequestException(`Unsupported provider: ${provider}`);
        }
        return this.authService.getOAuthUrl(provider, email);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Check if account exists for email' }),
    (0, common_1.Post)('check-account'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkAccount", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Send email verification' }),
    (0, common_1.Post)('send-verification'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendVerification", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Verify email address' }),
    (0, common_1.Post)('verify-email'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'OAuth callback handler' }),
    (0, common_1.Post)('callback'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "oauthCallback", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'User login (legacy)' }),
    (0, common_1.UseGuards)(local_auth_guard_1.LocalAuthGuard),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'User registration (legacy)' }),
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Initiate OAuth flow' }),
    (0, common_1.Get)(':provider'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "initiateOAuth", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map