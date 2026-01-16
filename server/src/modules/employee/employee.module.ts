import { Module } from '@nestjs/common';
import { EmployeeService } from './services/employee.service';
import { PayrollService } from './services/payroll.service';
import { PerformanceService } from './services/performance.service';
import { ComplianceService } from './services/compliance.service';
import { EmployeeRepository } from './repositories/employee.repository';
import { PayrollRepository } from './repositories/payroll.repository';
import { ComplianceRepository } from './repositories/compliance.repository';
import { EmployeeEnhancedResolver } from './resolvers/employee.resolver';
import { ComplianceResolver } from './resolvers/compliance.resolver';
import { PayrollResolver } from './resolvers/payroll.resolver';
import { PerformanceResolver } from './resolvers/performance.resolver';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { TenantModule } from '../tenant/tenant.module';
import { GraphQLCommonModule } from '../../common/graphql/graphql-common.module';
import { PubSubModule } from '../../common/graphql/pubsub.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    TenantModule,
    GraphQLCommonModule,
    PubSubModule,
  ],
  providers: [
    EmployeeService,
    PayrollService,
    PerformanceService,
    ComplianceService,
    EmployeeRepository,
    PayrollRepository,
    ComplianceRepository,
    EmployeeEnhancedResolver,
    ComplianceResolver,
    PayrollResolver,
    PerformanceResolver,
  ],
  exports: [
    EmployeeService,
    PayrollService,
    PerformanceService,
    ComplianceService,
    EmployeeRepository,
    PayrollRepository,
    ComplianceRepository,
  ],
})
export class EmployeeModule {}