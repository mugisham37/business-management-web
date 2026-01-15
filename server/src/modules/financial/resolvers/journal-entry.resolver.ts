import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JournalEntryService } from '../services/journal-entry.service';
import { CreateJournalEntryDto, UpdateJournalEntryDto, JournalEntryStatus, JournalEntryQueryDto } from '../dto/journal-entry.dto';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { FeatureGuard } from '../../tenant/guards/feature.guard';
import { RequireFeature } from '../../tenant/decorators/tenant.decorators';
import { RequirePermission } from '../../auth/decorators/auth.decorators';
import { CurrentUser } from '../../auth/decorators/auth.decorators';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { AuthenticatedUser } from '../../auth/interfaces/auth.interface';

/**
 * GraphQL resolver for Journal Entry operations
 * Handles journal entry CRUD, posting, reversals, and general ledger queries
 */
@Resolver()
@UseGuards(JwtAuthGuard, TenantGuard, FeatureGuard)
@RequireFeature('financial-management')
export class JournalEntryResolver extends BaseResolver {
  constructor(
    protected override readonly dataLoaderService: DataLoaderService,
    private readonly journalEntryService: JournalEntryService,
  ) {
    super(dataLoaderService);
  }

  /**
   * Query: Get journal entry by ID
   * Returns a single journal entry with its line items
   */
  @Query(() => String)
  @RequirePermission('financial:read')
  async journalEntry(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return await this.journalEntryService.findJournalEntryById(tenantId, id);
  }

  /**
   * Query: Get all journal entries
   * Returns list of journal entries with optional filtering
   */
  @Query(() => [String])
  @RequirePermission('financial:read')
  async journalEntries(
    @CurrentTenant() tenantId: string,
    @Args('dateFrom', { nullable: true }) dateFrom?: string,
    @Args('dateTo', { nullable: true }) dateTo?: string,
    @Args('status', { nullable: true }) status?: JournalEntryStatus,
    @Args('sourceType', { nullable: true }) sourceType?: string,
    @Args('limit', { nullable: true }) limit?: number,
  ): Promise<any[]> {
    const query: JournalEntryQueryDto = {
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
      ...(status && { status }),
      ...(sourceType && { sourceType }),
      ...(limit && { limit }),
    };

    return await this.journalEntryService.findAllJournalEntries(tenantId, query);
  }

  /**
   * Query: Get general ledger
   * Returns account ledger with all transactions
   */
  @Query(() => [String])
  @RequirePermission('financial:read')
  async getGeneralLedger(
    @Args('accountId', { type: () => ID }) accountId: string,
    @CurrentTenant() tenantId: string,
    @Args('dateFrom', { nullable: true }) dateFrom?: Date,
    @Args('dateTo', { nullable: true }) dateTo?: Date,
    @Args('includeUnposted', { nullable: true }) includeUnposted?: boolean,
  ): Promise<any[]> {
    return await this.journalEntryService.getAccountLedger(tenantId, accountId, {
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
      ...(includeUnposted !== undefined && { includeUnposted }),
    });
  }

  /**
   * Mutation: Create journal entry
   * Creates a new journal entry with validation
   */
  @Mutation(() => String)
  @RequirePermission('financial:manage')
  async createJournalEntry(
    @Args('input') input: any,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<any> {
    const dto: CreateJournalEntryDto = {
      entryDate: input.entryDate,
      description: input.description,
      reference: input.reference,
      sourceType: input.sourceType || 'manual',
      sourceId: input.sourceId,
      notes: input.notes,
      lines: input.lines.map((line: any) => ({
        lineNumber: line.lineNumber,
        accountId: line.accountId,
        debitAmount: line.debitAmount || '0.00',
        creditAmount: line.creditAmount || '0.00',
        description: line.description,
        reference: line.reference,
        departmentId: line.departmentId,
        projectId: line.projectId,
        locationId: line.locationId,
        customerId: line.customerId,
        supplierId: line.supplierId,
      })),
    };

    // Validate that debits equal credits
    const totalDebits = dto.lines.reduce((sum, line) => sum + parseFloat(line.debitAmount), 0);
    const totalCredits = dto.lines.reduce((sum, line) => sum + parseFloat(line.creditAmount), 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new Error('Total debits must equal total credits');
    }

    return await this.journalEntryService.createJournalEntry(tenantId, dto, user.id);
  }

  /**
   * Mutation: Update journal entry
   * Updates an existing journal entry (only if draft)
   */
  @Mutation(() => String)
  @RequirePermission('financial:manage')
  async updateJournalEntry(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: any,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<any> {
    const dto: UpdateJournalEntryDto = {
      description: input.description,
      reference: input.reference,
      notes: input.notes,
      lines: input.lines?.map((line: any) => ({
        lineNumber: line.lineNumber,
        accountId: line.accountId,
        debitAmount: line.debitAmount || '0.00',
        creditAmount: line.creditAmount || '0.00',
        description: line.description,
        reference: line.reference,
        departmentId: line.departmentId,
        projectId: line.projectId,
        locationId: line.locationId,
        customerId: line.customerId,
        supplierId: line.supplierId,
      })),
    };

    // Validate debits equal credits if lines are provided
    if (dto.lines) {
      const totalDebits = dto.lines.reduce((sum, line) => sum + parseFloat(line.debitAmount), 0);
      const totalCredits = dto.lines.reduce((sum, line) => sum + parseFloat(line.creditAmount), 0);

      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        throw new Error('Total debits must equal total credits');
      }
    }

    return await this.journalEntryService.updateJournalEntry(tenantId, id, dto, user.id);
  }

  /**
   * Mutation: Post journal entry
   * Posts a draft journal entry to the general ledger
   */
  @Mutation(() => String)
  @RequirePermission('financial:post')
  async postJournalEntry(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Args('postingDate', { nullable: true }) postingDate?: Date,
  ): Promise<any> {
    return await this.journalEntryService.postJournalEntry(
      tenantId,
      id,
      user.id,
      postingDate,
    );
  }

  /**
   * Mutation: Reverse journal entry
   * Creates a reversing entry for a posted journal entry
   */
  @Mutation(() => String)
  @RequirePermission('financial:post')
  async reverseJournalEntry(
    @Args('id', { type: () => ID }) id: string,
    @Args('reason') reason: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Args('reversalDate', { nullable: true }) reversalDate?: Date,
  ): Promise<any> {
    return await this.journalEntryService.reverseJournalEntry(
      tenantId,
      id,
      user.id,
      reason,
      reversalDate,
    );
  }

  /**
   * Mutation: Delete journal entry
   * Deletes a journal entry (only if draft)
   */
  @Mutation(() => Boolean)
  @RequirePermission('financial:manage')
  async deleteJournalEntry(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    await this.journalEntryService.deleteJournalEntry(tenantId, id, user.id);
    return true;
  }
}
