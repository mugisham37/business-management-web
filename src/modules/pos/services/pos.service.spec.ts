import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException } from '@nestjs/common';
import { POSService } from './pos.service';
import { TransactionService } from './transaction.service';
import { PaymentService } from './payment.service';
import { TransactionValidationService } from './transaction-validation.service';
import { CreateTransactionDto, PaymentMethod, TransactionStatus } from '../dto/transaction.dto';
import { TransactionWithItems } from '../entities/transaction.entity';

describe('POSService', () => {
  let service: POSService;
  let mockTransactionService: jest.Mocked<TransactionService>;
  let mockPaymentService: jest.Mocked<PaymentService>;
  let mockValidationService: jest.Mocked<TransactionValidationService>;
  let mockEventEmitter: jest.Mocked<EventEmitter2>;

  const mockTransaction: TransactionWithItems = {
    id: 'txn-123',
    tenantId: 'tenant-1',
    transactionNumber: 'TXN-20240101-0001',
    customerId: 'customer-1',
    locationId: 'location-1',
    subtotal: 10.00,
    taxAmount: 1.00,
    discountAmount: 0.00,
    tipAmount: 0.00,
    total: 11.00,
    status: 'pending',
    itemCount: 1,
    notes: undefined,
    paymentMethod: 'card',
    paymentStatus: 'pending',
    paymentReference: undefined,
    isOfflineTransaction: false,
    offlineTimestamp: undefined,
    syncedAt: undefined,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user-1',
    updatedBy: 'user-1',
    deletedAt: undefined,
    version: 1,
    isActive: true,
    items: [
      {
        id: 'item-1',
        tenantId: 'tenant-1',
        transactionId: 'txn-123',
        productId: 'product-1',
        productSku: 'SKU-001',
        productName: 'Test Product',
        quantity: 1,
        unitPrice: 10.00,
        lineTotal: 10.00,
        discountAmount: 0.00,
        taxAmount: 0.00,
        variantInfo: {},
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
        deletedAt: undefined,
        version: 1,
        isActive: true,
      },
    ],
    payments: [],
  };

  const mockTransactionDto: CreateTransactionDto = {
    customerId: 'customer-1',
    locationId: 'location-1',
    items: [
      {
        productId: 'product-1',
        productSku: 'SKU-001',
        productName: 'Test Product',
        quantity: 1,
        unitPrice: 10.00,
      },
    ],
    paymentMethod: PaymentMethod.CARD,
    taxAmount: 1.00,
  };

  beforeEach(async () => {
    const mockTransactionServiceMethods = {
      createTransaction: jest.fn(),
      updateTransaction: jest.fn(),
      findById: jest.fn(),
      voidTransaction: jest.fn(),
      refundTransaction: jest.fn(),
      findTransactionsByTenant: jest.fn(),
      getTransactionSummary: jest.fn(),
    };

    const mockPaymentServiceMethods = {
      processPayment: jest.fn(),
      voidPayment: jest.fn(),
      refundPayment: jest.fn(),
    };

    const mockValidationServiceMethods = {
      validateTransaction: jest.fn(),
      validateOfflineTransaction: jest.fn(),
      validateVoid: jest.fn(),
      validateRefund: jest.fn(),
    };

    const mockEventEmitterMethods = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        POSService,
        {
          provide: TransactionService,
          useValue: mockTransactionServiceMethods,
        },
        {
          provide: PaymentService,
          useValue: mockPaymentServiceMethods,
        },
        {
          provide: TransactionValidationService,
          useValue: mockValidationServiceMethods,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitterMethods,
        },
      ],
    }).compile();

    service = module.get<POSService>(POSService);
    mockTransactionService = module.get(TransactionService);
    mockPaymentService = module.get(PaymentService);
    mockValidationService = module.get(TransactionValidationService);
    mockEventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processTransaction', () => {
    it('should successfully process a transaction', async () => {
      // Arrange
      const tenantId = 'tenant-1';
      const userId = 'user-1';
      
      mockTransactionService.createTransaction.mockResolvedValue(mockTransaction);
      mockPaymentService.processPayment.mockResolvedValue({
        success: true,
        paymentId: 'payment-1',
        providerTransactionId: 'stripe-123',
      });
      mockTransactionService.updateTransaction.mockResolvedValue({
        ...mockTransaction,
        status: 'completed',
      });

      // Act
      const result = await service.processTransaction(tenantId, mockTransactionDto, userId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('txn-123');
      expect(result.status).toBe(TransactionStatus.COMPLETED);
      expect(mockTransactionService.createTransaction).toHaveBeenCalledWith(
        tenantId,
        mockTransactionDto,
        userId
      );
      expect(mockPaymentService.processPayment).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('pos.transaction.completed', expect.any(Object));
    });

    it('should handle payment failure', async () => {
      // Arrange
      const tenantId = 'tenant-1';
      const userId = 'user-1';
      
      mockTransactionService.createTransaction.mockResolvedValue(mockTransaction);
      mockPaymentService.processPayment.mockResolvedValue({
        success: false,
        paymentId: 'payment-1',
        error: 'Card declined',
      });
      mockTransactionService.updateTransaction.mockResolvedValue({
        ...mockTransaction,
        status: 'failed',
      });

      // Act & Assert
      await expect(
        service.processTransaction(tenantId, mockTransactionDto, userId)
      ).rejects.toThrow(BadRequestException);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith('pos.transaction.failed', expect.any(Object));
    });

    it('should complete transaction within performance requirements', async () => {
      // Arrange
      const tenantId = 'tenant-1';
      const userId = 'user-1';
      
      mockTransactionService.createTransaction.mockResolvedValue(mockTransaction);
      mockPaymentService.processPayment.mockResolvedValue({
        success: true,
        paymentId: 'payment-1',
        providerTransactionId: 'stripe-123',
      });
      mockTransactionService.updateTransaction.mockResolvedValue({
        ...mockTransaction,
        status: 'completed',
      });

      // Act
      const startTime = Date.now();
      await service.processTransaction(tenantId, mockTransactionDto, userId);
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Assert - Should complete within 200ms (requirement 4.1, 18.1)
      expect(processingTime).toBeLessThan(200);
    });
  });

  describe('getTransaction', () => {
    it('should retrieve transaction by id', async () => {
      // Arrange
      const tenantId = 'tenant-1';
      const transactionId = 'txn-123';
      
      mockTransactionService.findById.mockResolvedValue(mockTransaction);

      // Act
      const result = await service.getTransaction(tenantId, transactionId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(transactionId);
      expect(mockTransactionService.findById).toHaveBeenCalledWith(tenantId, transactionId);
    });
  });

  describe('voidTransaction', () => {
    it('should successfully void a transaction', async () => {
      // Arrange
      const tenantId = 'tenant-1';
      const transactionId = 'txn-123';
      const reason = 'Customer request';
      const notes = 'Customer changed mind';
      const userId = 'user-1';
      
      const voidedTransaction = { ...mockTransaction, status: 'voided' };
      mockTransactionService.voidTransaction.mockResolvedValue(voidedTransaction);
      mockPaymentService.voidPayment.mockResolvedValue(undefined);
      mockTransactionService.findById.mockResolvedValue({
        ...mockTransaction,
        status: 'voided',
      });

      // Act
      const result = await service.voidTransaction(tenantId, transactionId, reason, notes, userId);

      // Assert
      expect(result).toBeDefined();
      expect(mockTransactionService.voidTransaction).toHaveBeenCalledWith(
        tenantId,
        transactionId,
        { reason, notes },
        userId
      );
      expect(mockPaymentService.voidPayment).toHaveBeenCalledWith(tenantId, transactionId, userId);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('pos.transaction.voided', expect.any(Object));
    });
  });

  describe('refundTransaction', () => {
    it('should successfully refund a transaction', async () => {
      // Arrange
      const tenantId = 'tenant-1';
      const transactionId = 'txn-123';
      const amount = 5.00;
      const reason = 'Defective product';
      const notes = 'Product was damaged';
      const userId = 'user-1';
      
      const refundResult = {
        transaction: { ...mockTransaction, status: 'refunded' },
        refundPayment: {
          id: 'refund-1',
          tenantId: 'tenant-1',
          transactionId: 'txn-123',
          paymentMethod: 'card',
          amount: -5.00,
          status: 'captured',
          paymentProvider: 'stripe',
          providerTransactionId: 'refund-stripe-123',
          providerResponse: {},
          processedAt: new Date(),
          failureReason: undefined,
          refundedAmount: 0,
          refundedAt: undefined,
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user-1',
          updatedBy: 'user-1',
          deletedAt: undefined,
          version: 1,
          isActive: true,
        },
      };
      
      mockTransactionService.refundTransaction.mockResolvedValue(refundResult);
      mockPaymentService.refundPayment.mockResolvedValue(undefined);
      mockTransactionService.findById.mockResolvedValue({
        ...mockTransaction,
        status: 'refunded',
      });

      // Act
      const result = await service.refundTransaction(tenantId, transactionId, amount, reason, notes, userId);

      // Assert
      expect(result).toBeDefined();
      expect(mockTransactionService.refundTransaction).toHaveBeenCalledWith(
        tenantId,
        transactionId,
        { amount, reason, notes },
        userId
      );
      expect(mockPaymentService.refundPayment).toHaveBeenCalledWith(tenantId, transactionId, amount, userId);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('pos.transaction.refunded', expect.any(Object));
    });
  });

  describe('getTransactionHistory', () => {
    it('should retrieve paginated transaction history', async () => {
      // Arrange
      const tenantId = 'tenant-1';
      const options = { limit: 10, offset: 0, locationId: 'location-1' };
      
      const mockTransactions = [mockTransaction];
      const mockSummary = {
        totalTransactions: 1,
        totalAmount: 11.00,
        averageTransactionValue: 11.00,
        completedTransactions: 1,
        voidedTransactions: 0,
        refundedTransactions: 0,
      };
      
      mockTransactionService.findTransactionsByTenant.mockResolvedValue({
        transactions: mockTransactions,
        total: 1,
      });
      mockTransactionService.getTransactionSummary.mockResolvedValue(mockSummary);

      // Act
      const result = await service.getTransactionHistory(tenantId, options);

      // Assert
      expect(result).toBeDefined();
      expect(result.transactions).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.summary).toEqual(mockSummary);
    });
  });

  describe('getDailySummary', () => {
    it('should generate daily sales summary', async () => {
      // Arrange
      const tenantId = 'tenant-1';
      const locationId = 'location-1';
      const date = new Date('2024-01-01');
      
      const mockSummary = {
        totalTransactions: 5,
        totalAmount: 100.00,
        averageTransactionValue: 20.00,
        completedTransactions: 4,
        voidedTransactions: 1,
        refundedTransactions: 0,
      };
      
      const mockTransactions = [
        { ...mockTransaction, paymentMethod: 'cash', total: 20.00, status: 'completed' },
        { ...mockTransaction, paymentMethod: 'card', total: 30.00, status: 'completed' },
        { ...mockTransaction, paymentMethod: 'card', total: 25.00, status: 'completed' },
        { ...mockTransaction, paymentMethod: 'cash', total: 15.00, status: 'completed' },
        { ...mockTransaction, paymentMethod: 'card', total: 10.00, status: 'voided' },
      ];
      
      mockTransactionService.getTransactionSummary.mockResolvedValue(mockSummary);
      mockTransactionService.findTransactionsByTenant.mockResolvedValue({
        transactions: mockTransactions,
        total: 5,
      });

      // Act
      const result = await service.getDailySummary(tenantId, locationId, date);

      // Assert
      expect(result).toBeDefined();
      expect(result.date).toEqual(date);
      expect(result.totalSales).toBe(100.00);
      expect(result.totalTransactions).toBe(5);
      expect(result.averageTransactionValue).toBe(20.00);
      expect(result.cashSales).toBe(35.00); // 20 + 15
      expect(result.cardSales).toBe(55.00); // 30 + 25
      expect(result.voidedTransactions).toBe(1);
    });
  });
});