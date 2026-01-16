import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EncryptionService } from './services/encryption.service';
import { AuditService } from './services/audit.service';
import { SecurityMonitoringService } from './services/security-monitoring.service';
import { ThreatDetectionService } from './services/threat-detection.service';
import { ComplianceService } from './services/compliance.service';
import { DataDeletionService } from './services/data-deletion.service';
import { KeyManagementService } from './services/key-management.service';
import { EnterpriseAuthService } from './services/enterprise-auth.service';
import { PenetrationTestingService } from './services/penetration-testing.service';
import { DrizzleService } from '../database/drizzle.service';
import { CustomLoggerService } from '../logger/logger.service';
import { GraphQLCommonModule } from '../../common/graphql/graphql-common.module';
import { QueueModule } from '../queue/queue.module';
import { SecurityResolver } from './resolvers/security.resolver';
import { AuditResolver } from './resolvers/audit.resolver';
import { ComplianceResolver } from './resolvers/compliance.resolver';
import { SecurityDashboardResolver } from './resolvers/security-dashboard.resolver';

@Module({
  imports: [
    ConfigModule,
    GraphQLCommonModule,
    QueueModule,
  ],
  providers: [
    DrizzleService,
    CustomLoggerService,
    EncryptionService,
    AuditService,
    SecurityMonitoringService,
    ThreatDetectionService,
    ComplianceService,
    DataDeletionService,
    KeyManagementService,
    EnterpriseAuthService,
    PenetrationTestingService,
    // GraphQL Resolvers
    SecurityResolver,
    AuditResolver,
    ComplianceResolver,
    SecurityDashboardResolver,
  ],
  exports: [
    EncryptionService,
    AuditService,
    SecurityMonitoringService,
    ThreatDetectionService,
    ComplianceService,
    DataDeletionService,
    KeyManagementService,
    EnterpriseAuthService,
    PenetrationTestingService,
  ],
})
export class SecurityModule {}