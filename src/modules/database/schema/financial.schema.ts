import { pgTable, varchar, decimal, timestamp, uuid, integer, boolean, text, jsonb, index, pgEnum } from 'drizzle-orm/pg-core';
import { baseSchema } from './base.schema';
import { tenants } from './tenant.schema';
import { users } from './user.schema';
import { transactions } from './transaction.schema';

// Enums for financial system
export const accountTypeEnum = pgEnum('account_type', [
  'asset',
  'liability', 
  'equity',
  'revenue',
  'expense',
  'contra_asset',
  'contra_liability',
  'contra_equity',
  'contra_revenue'
]);

export const accountSubTypeEnum = pgEnum('account_sub_type', [
  // Assets
  'current_asset',
  'fixed_asset',
  'other_asset',
  'cash',
  'accounts_receivable',
  'inventory',
  'prepaid_expense',
  'equipment',
  'accumulated_depreciation',
  
  // Liabilities
  'current_liability',
  'long_term_liability',
  'accounts_payable',
  'accrued_expense',
  'notes_payable',
  'mortgage_payable',
  
  // Equity
  'owners_equity',
  'retained_earnings',
  'capital_stock',
  
  // Revenue
  'sales_revenue',
  'service_revenue',
  'other_revenue',
  'sales_returns',
  'sales_discounts',
  
  // Expenses
  'cost_of_goods_sold',
  'operating_expense',
  'administrative_expense',
  'selling_expense',
  'interest_expense',
  'depreciation_expense'
]);

export const journalEntryStatusEnum = pgEnum('journal_entry_status', [
  'draft',
  'posted',
  'reversed',
  'voided'
]);

export const reconciliationStatusEnum = pgEnum('reconciliation_status', [
  'unreconciled',
  'reconciled',
  'disputed'
]);

// Chart of Accounts
export const chartOfAccounts = pgTable('chart_of_accounts', {
  ...baseSchema,
  
  // Account identification
  accountNumber: varchar('account_number', { length: 20 }).notNull(),
  accountName: varchar('account_name', { length: 255 }).notNull(),
  accountType: accountTypeEnum('account_type').notNull(),
  accountSubType: accountSubTypeEnum('account_sub_type').notNull(),
  
  // Hierarchy
  parentAccountId: uuid('parent_account_id').references(() => chartOfAccounts.id),
  accountLevel: integer('account_level').default(1).notNull(),
  accountPath: varchar('account_path', { length: 500 }), // For hierarchical queries
  
  // Account properties
  isActive: boolean('is_active').default(true).notNull(),
  isSystemAccount: boolean('is_system_account').default(false).notNull(),
  allowManualEntries: boolean('allow_manual_entries').default(true).notNull(),
  requireDepartment: boolean('require_department').default(false).notNull(),
  requireProject: boolean('require_project').default(false).notNull(),
  
  // Balance tracking
  currentBalance: decimal('current_balance', { precision: 15, scale: 2 }).default('0.00').notNull(),
  normalBalance: varchar('normal_balance', { length: 10 }).notNull(), // 'debit' or 'credit'
  
  // Metadata
  description: text('description'),
  taxReportingCategory: varchar('tax_reporting_category', { length: 100 }),
  externalAccountId: varchar('external_account_id', { length: 100 }), // For integrations
  
  // Configuration
  settings: jsonb('settings').default({}),
}, (table) => ({
  tenantAccountNumberIdx: index('idx_coa_tenant_account_number').on(table.tenantId, table.accountNumber),
  tenantAccountTypeIdx: index('idx_coa_tenant_account_type').on(table.tenantId, table.accountType),
  parentAccountIdx: index('idx_coa_parent_account').on(table.parentAccountId),
  accountPathIdx: index('idx_coa_account_path').on(table.accountPath),
}));

// Journal Entries (Double-entry bookkeeping)
export const journalEntries = pgTable('journal_entries', {
  ...baseSchema,
  
  // Entry identification
  entryNumber: varchar('entry_number', { length: 50 }).notNull(),
  entryDate: timestamp('entry_date').notNull(),
  postingDate: timestamp('posting_date'),
  
  // Entry details
  description: text('description').notNull(),
  reference: varchar('reference', { length: 100 }), // Invoice number, check number, etc.
  status: journalEntryStatusEnum('status').default('draft').notNull(),
  
  // Source information
  sourceType: varchar('source_type', { length: 50 }), // 'manual', 'pos_transaction', 'payroll', etc.
  sourceId: uuid('source_id'), // ID of the source record
  
  // Approval workflow
  approvedBy: uuid('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at'),
  
  // Reversal information
  reversedBy: uuid('reversed_by').references(() => users.id),
  reversedAt: timestamp('reversed_at'),
  reversalReason: text('reversal_reason'),
  originalEntryId: uuid('original_entry_id').references(() => journalEntries.id),
  
  // Metadata
  notes: text('notes'),
  attachments: jsonb('attachments').default([]),
  
  // Totals for validation
  totalDebits: decimal('total_debits', { precision: 15, scale: 2 }).notNull(),
  totalCredits: decimal('total_credits', { precision: 15, scale: 2 }).notNull(),
}, (table) => ({
  tenantEntryNumberIdx: index('idx_je_tenant_entry_number').on(table.tenantId, table.entryNumber),
  tenantEntryDateIdx: index('idx_je_tenant_entry_date').on(table.tenantId, table.entryDate),
  tenantStatusIdx: index('idx_je_tenant_status').on(table.tenantId, table.status),
  sourceIdx: index('idx_je_source').on(table.sourceType, table.sourceId),
  originalEntryIdx: index('idx_je_original_entry').on(table.originalEntryId),
}));

// Journal Entry Line Items
export const journalEntryLines = pgTable('journal_entry_lines', {
  ...baseSchema,
  
  // Relationships
  journalEntryId: uuid('journal_entry_id').notNull().references(() => journalEntries.id, { onDelete: 'cascade' }),
  accountId: uuid('account_id').notNull().references(() => chartOfAccounts.id),
  
  // Line details
  lineNumber: integer('line_number').notNull(),
  description: text('description'),
  
  // Amounts
  debitAmount: decimal('debit_amount', { precision: 15, scale: 2 }).default('0.00').notNull(),
  creditAmount: decimal('credit_amount', { precision: 15, scale: 2 }).default('0.00').notNull(),
  
  // Dimensions for reporting
  departmentId: uuid('department_id'),
  projectId: uuid('project_id'),
  locationId: uuid('location_id'),
  customerId: uuid('customer_id'),
  supplierId: uuid('supplier_id'),
  
  // Reconciliation
  reconciliationStatus: reconciliationStatusEnum('reconciliation_status').default('unreconciled').notNull(),
  reconciledAt: timestamp('reconciled_at'),
  reconciledBy: uuid('reconciled_by').references(() => users.id),
  
  // Metadata
  reference: varchar('reference', { length: 100 }),
  externalReference: varchar('external_reference', { length: 100 }),
}, (table) => ({
  journalEntryIdx: index('idx_jel_journal_entry').on(table.journalEntryId),
  accountIdx: index('idx_jel_account').on(table.accountId),
  tenantAccountDateIdx: index('idx_jel_tenant_account_date').on(table.tenantId, table.accountId, table.createdAt),
  reconciliationIdx: index('idx_jel_reconciliation').on(table.reconciliationStatus),
}));

// Account Balances (for performance - materialized view concept)
export const accountBalances = pgTable('account_balances', {
  ...baseSchema,
  
  // Relationships
  accountId: uuid('account_id').notNull().references(() => chartOfAccounts.id),
  
  // Balance information
  balanceDate: timestamp('balance_date').notNull(),
  openingBalance: decimal('opening_balance', { precision: 15, scale: 2 }).default('0.00').notNull(),
  debitMovements: decimal('debit_movements', { precision: 15, scale: 2 }).default('0.00').notNull(),
  creditMovements: decimal('credit_movements', { precision: 15, scale: 2 }).default('0.00').notNull(),
  closingBalance: decimal('closing_balance', { precision: 15, scale: 2 }).default('0.00').notNull(),
  
  // Period information
  fiscalYear: integer('fiscal_year').notNull(),
  fiscalPeriod: integer('fiscal_period').notNull(), // 1-12 for months, or custom periods
  
  // Metadata
  isAdjusted: boolean('is_adjusted').default(false).notNull(),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
}, (table) => ({
  accountBalanceDateIdx: index('idx_ab_account_balance_date').on(table.accountId, table.balanceDate),
  tenantFiscalIdx: index('idx_ab_tenant_fiscal').on(table.tenantId, table.fiscalYear, table.fiscalPeriod),
  balanceDateIdx: index('idx_ab_balance_date').on(table.balanceDate),
}));

// Fiscal Periods
export const fiscalPeriods = pgTable('fiscal_periods', {
  ...baseSchema,
  
  // Period identification
  fiscalYear: integer('fiscal_year').notNull(),
  periodNumber: integer('period_number').notNull(),
  periodName: varchar('period_name', { length: 50 }).notNull(),
  
  // Period dates
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  
  // Status
  isActive: boolean('is_active').default(true).notNull(),
  isClosed: boolean('is_closed').default(false).notNull(),
  closedAt: timestamp('closed_at'),
  closedBy: uuid('closed_by').references(() => users.id),
  
  // Year-end processing
  isYearEnd: boolean('is_year_end').default(false).notNull(),
  yearEndProcessed: boolean('year_end_processed').default(false).notNull(),
  yearEndProcessedAt: timestamp('year_end_processed_at'),
}, (table) => ({
  tenantFiscalYearPeriodIdx: index('idx_fp_tenant_fiscal_year_period').on(table.tenantId, table.fiscalYear, table.periodNumber),
  tenantDateRangeIdx: index('idx_fp_tenant_date_range').on(table.tenantId, table.startDate, table.endDate),
}));

// Budget Management
export const budgets = pgTable('budgets', {
  ...baseSchema,
  
  // Budget identification
  budgetName: varchar('budget_name', { length: 255 }).notNull(),
  budgetType: varchar('budget_type', { length: 50 }).notNull(), // 'annual', 'quarterly', 'monthly', 'project'
  
  // Period
  fiscalYear: integer('fiscal_year').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  
  // Status
  status: varchar('status', { length: 20 }).default('draft').notNull(), // 'draft', 'approved', 'active', 'closed'
  approvedBy: uuid('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at'),
  
  // Metadata
  description: text('description'),
  notes: text('notes'),
  version: integer('version').default(1).notNull(),
}, (table) => ({
  tenantFiscalYearIdx: index('idx_budget_tenant_fiscal_year').on(table.tenantId, table.fiscalYear),
  tenantStatusIdx: index('idx_budget_tenant_status').on(table.tenantId, table.status),
}));

// Budget Line Items
export const budgetLines = pgTable('budget_lines', {
  ...baseSchema,
  
  // Relationships
  budgetId: uuid('budget_id').notNull().references(() => budgets.id, { onDelete: 'cascade' }),
  accountId: uuid('account_id').notNull().references(() => chartOfAccounts.id),
  
  // Budget amounts by period
  annualAmount: decimal('annual_amount', { precision: 15, scale: 2 }).default('0.00').notNull(),
  q1Amount: decimal('q1_amount', { precision: 15, scale: 2 }).default('0.00').notNull(),
  q2Amount: decimal('q2_amount', { precision: 15, scale: 2 }).default('0.00').notNull(),
  q3Amount: decimal('q3_amount', { precision: 15, scale: 2 }).default('0.00').notNull(),
  q4Amount: decimal('q4_amount', { precision: 15, scale: 2 }).default('0.00').notNull(),
  
  // Monthly breakdown
  monthlyAmounts: jsonb('monthly_amounts').default({}), // {1: amount, 2: amount, ...}
  
  // Dimensions
  departmentId: uuid('department_id'),
  projectId: uuid('project_id'),
  locationId: uuid('location_id'),
  
  // Metadata
  notes: text('notes'),
}, (table) => ({
  budgetAccountIdx: index('idx_bl_budget_account').on(table.budgetId, table.accountId),
  accountIdx: index('idx_bl_account').on(table.accountId),
}));

// Account Reconciliation
export const accountReconciliations = pgTable('account_reconciliations', {
  ...baseSchema,
  
  // Relationships
  accountId: uuid('account_id').notNull().references(() => chartOfAccounts.id),
  
  // Reconciliation details
  reconciliationDate: timestamp('reconciliation_date').notNull(),
  statementDate: timestamp('statement_date').notNull(),
  
  // Balances
  bookBalance: decimal('book_balance', { precision: 15, scale: 2 }).notNull(),
  statementBalance: decimal('statement_balance', { precision: 15, scale: 2 }).notNull(),
  adjustedBalance: decimal('adjusted_balance', { precision: 15, scale: 2 }).notNull(),
  
  // Status
  status: reconciliationStatusEnum('status').default('unreconciled').notNull(),
  reconciledBy: uuid('reconciled_by').references(() => users.id),
  
  // Differences
  outstandingDebits: decimal('outstanding_debits', { precision: 15, scale: 2 }).default('0.00').notNull(),
  outstandingCredits: decimal('outstanding_credits', { precision: 15, scale: 2 }).default('0.00').notNull(),
  
  // Metadata
  notes: text('notes'),
  attachments: jsonb('attachments').default([]),
}, (table) => ({
  accountReconciliationDateIdx: index('idx_ar_account_reconciliation_date').on(table.accountId, table.reconciliationDate),
  tenantStatusIdx: index('idx_ar_tenant_status').on(table.tenantId, table.status),
}));

// System-generated transaction postings
export const transactionPostings = pgTable('transaction_postings', {
  ...baseSchema,
  
  // Source transaction
  sourceTransactionId: uuid('source_transaction_id').notNull().references(() => transactions.id),
  journalEntryId: uuid('journal_entry_id').notNull().references(() => journalEntries.id),
  
  // Posting rules applied
  postingRuleId: uuid('posting_rule_id'),
  postingRuleName: varchar('posting_rule_name', { length: 100 }),
  
  // Status
  status: varchar('status', { length: 20 }).default('posted').notNull(),
  postedAt: timestamp('posted_at').defaultNow().notNull(),
  
  // Error handling
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').default(0).notNull(),
}, (table) => ({
  sourceTransactionIdx: index('idx_tp_source_transaction').on(table.sourceTransactionId),
  journalEntryIdx: index('idx_tp_journal_entry').on(table.journalEntryId),
  tenantStatusIdx: index('idx_tp_tenant_status').on(table.tenantId, table.status),
}));