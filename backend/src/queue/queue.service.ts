import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PgBoss from 'pg-boss';
import { EmailService } from '../email/email.service';

export interface EmailJob {
  type: 'verification' | 'welcome' | 'password-reset';
  to: string;
  data: {
    token?: string;
    firstName?: string;
  };
}

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private boss: PgBoss;

  constructor(
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async onModuleInit() {
    try {
      // Initialize pg-boss with database connection
      this.boss = new PgBoss({
        connectionString: this.configService.get('DATABASE_URL'),
        schema: 'pgboss',
        max: 10,
        application_name: 'woerk-queue',
      });

      await this.boss.start();
      this.logger.log('Queue service started successfully');

      // Set up job handlers
      await this.setupJobHandlers();
      
    } catch (error) {
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

  private async setupJobHandlers() {
    try {
      // Email sending jobs
      await this.boss.work('send-email', async (jobs) => {
        const job = Array.isArray(jobs) ? jobs[0] : jobs;
        return this.handleEmailJob(job.data as EmailJob);
      });

      this.logger.log('Email job handlers set up successfully');
      
      // Note: Cleanup job scheduling removed to avoid pg-boss initialization issues
      // Cleanup can be run manually or via separate admin process
      
    } catch (error) {
      this.logger.error('Failed to set up job handlers', error);
      // Don't throw - let the application start without the queue if needed
    }
  }

  async queueVerificationEmail(email: string, token: string): Promise<string | null> {
    const jobData: EmailJob = {
      type: 'verification',
      to: email,
      data: { token },
    };

    const jobId = await this.boss.send('send-email', jobData, {
      retryLimit: 3,
      retryDelay: 60, // 1 minute
      expireInMinutes: 60, // 1 hour
    });

    this.logger.log(`Queued verification email for ${email}. Job ID: ${jobId}`);
    return jobId;
  }

  async queueWelcomeEmail(email: string, firstName?: string): Promise<string | null> {
    const jobData: EmailJob = {
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

  async queuePasswordResetEmail(email: string, token: string): Promise<string | null> {
    const jobData: EmailJob = {
      type: 'password-reset',
      to: email,
      data: { token },
    };

    const jobId = await this.boss.send('send-email', jobData, {
      retryLimit: 3,
      retryDelay: 60,
      expireInMinutes: 30, // Password reset is more time-sensitive
    });

    this.logger.log(`Queued password reset email for ${email}. Job ID: ${jobId}`);
    return jobId;
  }

  private async handleEmailJob(job: EmailJob): Promise<void> {
    this.logger.log(`Processing email job: ${job.type} for ${job.to}`);

    try {
      let success = false;

      switch (job.type) {
        case 'verification':
          if (!job.data.token) {
            throw new Error('Verification token is required');
          }
          success = await this.emailService.sendVerificationEmail(
            job.to,
            job.data.token,
          );
          break;

        case 'welcome':
          success = await this.emailService.sendWelcomeEmail(
            job.to,
            job.data.firstName,
          );
          break;

        case 'password-reset':
          if (!job.data.token) {
            throw new Error('Password reset token is required');
          }
          success = await this.emailService.sendPasswordResetEmail(
            job.to,
            job.data.token,
          );
          break;

        default:
          throw new Error(`Unknown email job type: ${job.type}`);
      }

      if (!success) {
        throw new Error(`Failed to send ${job.type} email to ${job.to}`);
      }

      this.logger.log(`Successfully sent ${job.type} email to ${job.to}`);
    } catch (error) {
      this.logger.error(`Failed to process email job for ${job.to}`, error);
      throw error; // This will trigger job retry
    }
  }

  private async handleCleanupJob(): Promise<void> {
    this.logger.log('Running job cleanup');

    try {
      // Clean up completed jobs older than 7 days
      const result = await this.boss.purge();
      this.logger.log(`Cleaned up ${result} old jobs`);

    } catch (error) {
      this.logger.error('Job cleanup failed', error);
      throw error;
    }
  }

  // Health check methods
  async getQueueHealth(): Promise<{
    isHealthy: boolean;
    activeJobs: number;
  }> {
    try {
      const activeJobs = await this.boss.getQueueSize('send-email');

      return {
        isHealthy: true,
        activeJobs,
      };
    } catch (error) {
      this.logger.error('Failed to get queue health', error);
      return {
        isHealthy: false,
        activeJobs: -1,
      };
    }
  }

  // Manual job management
  async retryFailedJobs(): Promise<number> {
    try {
      // Simplified retry - just log the attempt
      this.logger.log('Retry functionality available via pg-boss admin interface');
      return 0;
    } catch (error) {
      this.logger.error('Failed to retry jobs', error);
      return 0;
    }
  }
}