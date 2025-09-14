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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var QueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const pg_boss_1 = __importDefault(require("pg-boss"));
const email_service_1 = require("../email/email.service");
let QueueService = QueueService_1 = class QueueService {
    configService;
    emailService;
    logger = new common_1.Logger(QueueService_1.name);
    boss;
    constructor(configService, emailService) {
        this.configService = configService;
        this.emailService = emailService;
    }
    async onModuleInit() {
        try {
            this.boss = new pg_boss_1.default({
                connectionString: this.configService.get('DATABASE_URL'),
                schema: 'pgboss',
                max: 10,
                application_name: 'woerk-queue',
            });
            await this.boss.start();
            this.logger.log('Queue service started successfully');
            await this.setupJobHandlers();
        }
        catch (error) {
            this.logger.error('Failed to start queue service', error);
            throw error;
        }
    }
    async onModuleDestroy() {
        if (this.boss) {
            await this.boss.stop();
            this.logger.log('Queue service stopped');
        }
    }
    async setupJobHandlers() {
        await this.boss.work('send-email', async (jobs) => {
            const job = Array.isArray(jobs) ? jobs[0] : jobs;
            return this.handleEmailJob(job.data);
        });
        await this.boss.work('cleanup-jobs', async () => {
            return this.handleCleanupJob();
        });
        await this.boss.schedule('cleanup-jobs', '0 2 * * *');
        this.logger.log('Job handlers set up successfully');
    }
    async queueVerificationEmail(email, token) {
        const jobData = {
            type: 'verification',
            to: email,
            data: { token },
        };
        const jobId = await this.boss.send('send-email', jobData, {
            retryLimit: 3,
            retryDelay: 60,
            expireInMinutes: 60,
        });
        this.logger.log(`Queued verification email for ${email}. Job ID: ${jobId}`);
        return jobId;
    }
    async queueWelcomeEmail(email, firstName) {
        const jobData = {
            type: 'welcome',
            to: email,
            data: { firstName },
        };
        const jobId = await this.boss.send('send-email', jobData, {
            retryLimit: 3,
            retryDelay: 60,
            expireInMinutes: 60,
        });
        this.logger.log(`Queued welcome email for ${email}. Job ID: ${jobId}`);
        return jobId;
    }
    async queuePasswordResetEmail(email, token) {
        const jobData = {
            type: 'password-reset',
            to: email,
            data: { token },
        };
        const jobId = await this.boss.send('send-email', jobData, {
            retryLimit: 3,
            retryDelay: 60,
            expireInMinutes: 30,
        });
        this.logger.log(`Queued password reset email for ${email}. Job ID: ${jobId}`);
        return jobId;
    }
    async handleEmailJob(job) {
        this.logger.log(`Processing email job: ${job.type} for ${job.to}`);
        try {
            let success = false;
            switch (job.type) {
                case 'verification':
                    if (!job.data.token) {
                        throw new Error('Verification token is required');
                    }
                    success = await this.emailService.sendVerificationEmail(job.to, job.data.token);
                    break;
                case 'welcome':
                    success = await this.emailService.sendWelcomeEmail(job.to, job.data.firstName);
                    break;
                case 'password-reset':
                    if (!job.data.token) {
                        throw new Error('Password reset token is required');
                    }
                    success = await this.emailService.sendPasswordResetEmail(job.to, job.data.token);
                    break;
                default:
                    throw new Error(`Unknown email job type: ${job.type}`);
            }
            if (!success) {
                throw new Error(`Failed to send ${job.type} email to ${job.to}`);
            }
            this.logger.log(`Successfully sent ${job.type} email to ${job.to}`);
        }
        catch (error) {
            this.logger.error(`Failed to process email job for ${job.to}`, error);
            throw error;
        }
    }
    async handleCleanupJob() {
        this.logger.log('Running job cleanup');
        try {
            const result = await this.boss.purge();
            this.logger.log(`Cleaned up ${result} old jobs`);
        }
        catch (error) {
            this.logger.error('Job cleanup failed', error);
            throw error;
        }
    }
    async getQueueHealth() {
        try {
            const activeJobs = await this.boss.getQueueSize('send-email');
            return {
                isHealthy: true,
                activeJobs,
            };
        }
        catch (error) {
            this.logger.error('Failed to get queue health', error);
            return {
                isHealthy: false,
                activeJobs: -1,
            };
        }
    }
    async retryFailedJobs() {
        try {
            this.logger.log('Retry functionality available via pg-boss admin interface');
            return 0;
        }
        catch (error) {
            this.logger.error('Failed to retry jobs', error);
            return 0;
        }
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = QueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        email_service_1.EmailService])
], QueueService);
//# sourceMappingURL=queue.service.js.map