import { Injectable, Inject } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { paymentRecords } from '../../database/schema/transaction.schema';
import { PaymentRecord } from '../entities/transaction.entity';

@Injectable()
export class PaymentRepository {
  constructor(
    @Inject(DrizzleService)
    private readonly drizzle: DrizzleService,
  ) {}

  async create(
    tenantId: string,
    paymentData: {
      transactionId: string;
      paymentMethod: string;
      amount: number;
      paymentProvider?: string;
      providerTransactionId?: string;
      providerResponse?: Record<string, any>;
      metadata?: Record<string, any>;
    },
    userId: string,
  ): Promise<PaymentRecord> {
    const db = this.drizzle.getDatabase();
    
    const [payment] = await db
      .insert(paymentRecords)
      .values({
        tenantId,
        transactionId: paymentData.transactionId,
        paymentMethod: paymentData.paymentMethod,
        amount: paymentData.amount.toFixed(2),
        status: 'pending',
        paymentProvider: paymentData.paymentProvider,
        providerTransactionId: paymentData.providerTransactionId,
        providerResponse: paymentData.providerResponse || {},
        refundedAmount: '0.00',
        metadata: paymentData.metadata || {},
        createdBy: userId,
        updatedBy: userId,
      })
      .returning();

    return this.mapToEntity(payment);
  }

  async update(
    tenantId: string,
    id: string,
    updates: {
      status?: string;
      processedAt?: Date;
      failureReason?: string;
      providerResponse?: Record<string, any>;
      refundedAmount?: number;
      refundedAt?: Date;
    },
    userId: string,
  ): Promise<PaymentRecord | null> {
    const db = this.drizzle.getDatabase();
    
    const updateData: any = {
      ...updates,
      updatedBy: userId,
      updatedAt: new Date(),
    };

    if (updates.refundedAmount !== undefined) {
      updateData.refundedAmount = updates.refundedAmount.toFixed(2);
    }
    
    const [updated] = await db
      .update(paymentRecords)
      .set(updateData)
      .where(and(
        eq(paymentRecords.tenantId, tenantId),
        eq(paymentRecords.id, id),
        eq(paymentRecords.isActive, true)
      ))
      .returning();

    return updated ? this.mapToEntity(updated) : null;
  }

  async findById(tenantId: string, id: string): Promise<PaymentRecord | null> {
    const db = this.drizzle.getDatabase();
    
    const [payment] = await db
      .select()
      .from(paymentRecords)
      .where(and(
        eq(paymentRecords.tenantId, tenantId),
        eq(paymentRecords.id, id),
        eq(paymentRecords.isActive, true)
      ));

    return payment ? this.mapToEntity(payment) : null;
  }

  async findByTransactionId(tenantId: string, transactionId: string): Promise<PaymentRecord[]> {
    const db = this.drizzle.getDatabase();
    
    const payments = await db
      .select()
      .from(paymentRecords)
      .where(and(
        eq(paymentRecords.tenantId, tenantId),
        eq(paymentRecords.transactionId, transactionId),
        eq(paymentRecords.isActive, true)
      ))
      .orderBy(desc(paymentRecords.createdAt));

    return payments.map(this.mapToEntity);
  }

  async findByProviderTransactionId(
    tenantId: string,
    providerTransactionId: string,
  ): Promise<PaymentRecord | null> {
    const db = this.drizzle.getDatabase();
    
    const [payment] = await db
      .select()
      .from(paymentRecords)
      .where(and(
        eq(paymentRecords.tenantId, tenantId),
        eq(paymentRecords.providerTransactionId, providerTransactionId),
        eq(paymentRecords.isActive, true)
      ));

    return payment ? this.mapToEntity(payment) : null;
  }

  private mapToEntity(row: any): PaymentRecord {
    return {
      id: row.id,
      tenantId: row.tenantId,
      transactionId: row.transactionId,
      paymentMethod: row.paymentMethod,
      amount: parseFloat(row.amount),
      status: row.status,
      paymentProvider: row.paymentProvider,
      providerTransactionId: row.providerTransactionId,
      providerResponse: row.providerResponse,
      processedAt: row.processedAt,
      failureReason: row.failureReason,
      refundedAmount: parseFloat(row.refundedAmount),
      refundedAt: row.refundedAt,
      metadata: row.metadata,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      createdBy: row.createdBy,
      updatedBy: row.updatedBy,
      deletedAt: row.deletedAt,
      version: row.version,
      isActive: row.isActive,
    };
  }
}