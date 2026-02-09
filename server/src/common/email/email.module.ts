import { Module, Global } from '@nestjs/common';
import { EmailService } from './email.service';

/**
 * Email Module
 * 
 * Provides email sending functionality across the application.
 * Marked as @Global so it can be injected anywhere without importing.
 */
@Global()
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
