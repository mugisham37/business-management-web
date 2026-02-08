import { Module } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DatabaseModule } from '../../database/database.module';

/**
 * Departments Module
 * 
 * Provides department management functionality for organizing users
 * within an organization.
 * 
 * Features:
 * - Department CRUD operations
 * - Organization-scoped queries
 * - User assignment validation
 */
@Module({
  imports: [DatabaseModule],
  providers: [DepartmentsService],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}
