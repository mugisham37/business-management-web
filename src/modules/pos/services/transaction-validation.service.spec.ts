import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { TransactionValidationService } from './transaction-validation.service';
import { CreateTransactionDto, CreateTransactionItemDto, PaymentMethod } from '../dto/transaction.dto';

describe('TransactionValidationService', () => {
  let service: TransactionValidationService;

  const validTransactionItem: CreateTransactionItemDto = {
    productId: 'product-1',
    productSku: 'SKU-001',
    productName: 'Test Product',
    quantity: 1,
    unitPrice: 10.00,
  };

  const validTransactionDto: CreateTransactionDto = {
    locationId: 'location-1',
    items: [validTransactionItem],
    paymentMethod: PaymentMethod.CARD,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionValidationService],
    }).compile();

    service = module.get<TransactionValidationService>(TransactionValidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateTransaction', () => {
    it('should validate a valid transaction', () => {
      expect(() => service.validateTransaction(validTransactionDto)).not.toThrow();
    });

    it('should throw error for missing location ID', () => {
      const invalidDto = { ...validTransactionDto, locationId: '' };
      
      expect(() => service.validateTransaction(invalidDto)).toThrow(BadRequestException);
      expect(() => service.validateTransaction(invalidDto)).toThrow('Location ID is required');
    });

    it('should throw error for empty items array', () => {
      const invalidDto = { ...validTransactionDto, items: [] };
      
      expect(() => service.validateTransaction(invalidDto)).toThrow(BadRequestException);
      expect(() => service.validateTransaction(invalidDto)).toThrow('Transaction must have at least one item');
    });

    it('should throw error for missing payment method', () => {
      const invalidDto = { ...validTransactionDto, paymentMethod: undefined as any };
      
      expect(() => service.validateTransaction(invalidDto)).toThrow(BadRequestException);
      expect(() => service.validateTransaction(invalidDto)).toThrow('Payment method is required');
    });

    it('should throw error for negative tax amount', () => {
      const invalidDto = { ...validTransactionDto, taxAmount: -1.00 };
      
      expect(() => service.validateTransaction(invalidDto)).toThrow(BadRequestException);
      expect(() => service.validateTransaction(invalidDto)).toThrow('Tax amount cannot be negative');
    });

    it('should throw error for negative discount amount', () => {
      const invalidDto = { ...validTransactionDto, discountAmount: -1.00 };
      
      expect(() => service.validateTransaction(invalidDto)).toThrow(BadRequestException);
      expect(() => service.validateTransaction(invalidDto)).toThrow('Discount amount cannot be negative');
    });

    it('should throw error for negative tip amount', () => {
      const invalidDto = { ...validTransactionDto, tipAmount: -1.00 };
      
      expect(() => service.validateTransaction(invalidDto)).toThrow(BadRequestException);
      expect(() => service.validateTransaction(invalidDto)).toThrow('Tip amount cannot be negative');
    });

    it('should throw error when discount exceeds subtotal', () => {
      const invalidDto = { 
        ...validTransactionDto, 
        discountAmount: 20.00, // Greater than item total of 10.00
      };
      
      expect(() => service.validateTransaction(invalidDto)).toThrow(BadRequestException);
      expect(() => service.validateTransaction(invalidDto)).toThrow('Discount amount cannot exceed subtotal');
    });

    it('should throw error for too many items', () => {
      const manyItems = Array(101).fill(validTransactionItem); // Exceeds MAX_ITEMS_PER_TRANSACTION
      const invalidDto = { ...validTransactionDto, items: manyItems };
      
      expect(() => service.validateTransaction(invalidDto)).toThrow(BadRequestException);
      expect(() => service.validateTransaction(invalidDto)).toThrow('Transaction cannot have more than 100 items');
    });

    it('should throw error for excessive transaction amount', () => {
      const expensiveItem = { ...validTransactionItem, unitPrice: 100001 }; // Exceeds MAX_TRANSACTION_AMOUNT
      const invalidDto = { ...validTransactionDto, items: [expensiveItem] };
      
      expect(() => service.validateTransaction(invalidDto)).toThrow(BadRequestException);
      expect(() => service.validateTransaction(invalidDto)).toThrow('Transaction amount cannot exceed 100,000');
    });

    it('should throw error for excessive quantity per item', () => {
      const highQuantityItem = { ...validTransactionItem, quantity: 10001 }; // Exceeds MAX_QUANTITY_PER_ITEM
      const invalidDto = { ...validTransactionDto, items: [highQuantityItem] };
      
      expect(() => service.validateTransaction(invalidDto)).toThrow(BadRequestException);
      expect(() => service.validateTransaction(invalidDto)).toThrow('Quantity cannot exceed 10000');
    });

    it('should throw error for excessive notes length', () => {
      const longNotes = 'a'.repeat(1001); // Exceeds 1000 character limit
      const invalidDto = { ...validTransactionDto, notes: longNotes };
      
      expect(() => service.validateTransaction(invalidDto)).toThrow(BadRequestException);
      expect(() => service.validateTransaction(invalidDto)).toThrow('Transaction notes cannot exceed 1000 characters');
    });
  });

  describe('validateItems', () => {
    it('should validate valid items', () => {
      expect(() => service['validateItems']([validTransactionItem])).not.toThrow();
    });

    it('should throw error for missing product ID', () => {
      const invalidItem = { ...validTransactionItem, productId: '' };
      
      expect(() => service['validateItems']([invalidItem])).toThrow(BadRequestException);
      expect(() => service['validateItems']([invalidItem])).toThrow('Product ID is required');
    });

    it('should throw error for missing product SKU', () => {
      const invalidItem = { ...validTransactionItem, productSku: '' };
      
      expect(() => service['validateItems']([invalidItem])).toThrow(BadRequestException);
      expect(() => service['validateItems']([invalidItem])).toThrow('Product SKU is required');
    });

    it('should throw error for missing product name', () => {
      const invalidItem = { ...validTransactionItem, productName: '' };
      
      expect(() => service['validateItems']([invalidItem])).toThrow(BadRequestException);
      expect(() => service['validateItems']([invalidItem])).toThrow('Product name is required');
    });

    it('should throw error for zero or negative quantity', () => {
      const invalidItem = { ...validTransactionItem, quantity: 0 };
      
      expect(() => service['validateItems']([invalidItem])).toThrow(BadRequestException);
      expect(() => service['validateItems']([invalidItem])).toThrow('Quantity must be greater than 0');
    });

    it('should throw error for negative unit price', () => {
      const invalidItem = { ...validTransactionItem, unitPrice: -1.00 };
      
      expect(() => service['validateItems']([invalidItem])).toThrow(BadRequestException);
      expect(() => service['validateItems']([invalidItem])).toThrow('Unit price cannot be negative');
    });

    it('should throw error for negative discount amount', () => {
      const invalidItem = { ...validTransactionItem, discountAmount: -1.00 };
      
      expect(() => service['validateItems']([invalidItem])).toThrow(BadRequestException);
      expect(() => service['validateItems']([invalidItem])).toThrow('Discount amount cannot be negative');
    });

    it('should throw error when item discount exceeds line total', () => {
      const invalidItem = { 
        ...validTransactionItem, 
        unitPrice: 10.00,
        quantity: 1,
        discountAmount: 15.00, // Greater than line total of 10.00
      };
      
      expect(() => service['validateItems']([invalidItem])).toThrow(BadRequestException);
      expect(() => service['validateItems']([invalidItem])).toThrow('Discount amount cannot exceed line total');
    });
  });

  describe('validateRefund', () => {
    it('should validate valid refund', () => {
      expect(() => service.validateRefund(100.00, 50.00, 0)).not.toThrow();
    });

    it('should throw error for zero refund amount', () => {
      expect(() => service.validateRefund(100.00, 0, 0)).toThrow(BadRequestException);
      expect(() => service.validateRefund(100.00, 0, 0)).toThrow('Refund amount must be greater than 0');
    });

    it('should throw error for negative refund amount', () => {
      expect(() => service.validateRefund(100.00, -10.00, 0)).toThrow(BadRequestException);
      expect(() => service.validateRefund(100.00, -10.00, 0)).toThrow('Refund amount must be greater than 0');
    });

    it('should throw error when refund exceeds remaining amount', () => {
      expect(() => service.validateRefund(100.00, 60.00, 50.00)).toThrow(BadRequestException);
      expect(() => service.validateRefund(100.00, 60.00, 50.00)).toThrow('Refund amount cannot exceed remaining amount of 50.00');
    });

    it('should allow full refund', () => {
      expect(() => service.validateRefund(100.00, 100.00, 0)).not.toThrow();
    });

    it('should allow partial refund with existing refunds', () => {
      expect(() => service.validateRefund(100.00, 25.00, 50.00)).not.toThrow();
    });
  });

  describe('validateVoid', () => {
    it('should allow voiding pending transaction', () => {
      expect(() => service.validateVoid('pending')).not.toThrow();
    });

    it('should allow voiding processing transaction', () => {
      expect(() => service.validateVoid('processing')).not.toThrow();
    });

    it('should allow voiding completed transaction', () => {
      expect(() => service.validateVoid('completed')).not.toThrow();
    });

    it('should not allow voiding failed transaction', () => {
      expect(() => service.validateVoid('failed')).toThrow(BadRequestException);
      expect(() => service.validateVoid('failed')).toThrow("Transaction with status 'failed' cannot be voided");
    });

    it('should not allow voiding cancelled transaction', () => {
      expect(() => service.validateVoid('cancelled')).toThrow(BadRequestException);
      expect(() => service.validateVoid('cancelled')).toThrow("Transaction with status 'cancelled' cannot be voided");
    });

    it('should not allow voiding refunded transaction', () => {
      expect(() => service.validateVoid('refunded')).toThrow(BadRequestException);
      expect(() => service.validateVoid('refunded')).toThrow("Transaction with status 'refunded' cannot be voided");
    });

    it('should not allow voiding already voided transaction', () => {
      expect(() => service.validateVoid('voided')).toThrow(BadRequestException);
      expect(() => service.validateVoid('voided')).toThrow("Transaction with status 'voided' cannot be voided");
    });
  });

  describe('validatePaymentAmount', () => {
    it('should validate valid payment amount', () => {
      expect(() => service.validatePaymentAmount(100.00, 100.00)).not.toThrow();
    });

    it('should allow overpayment for cash transactions', () => {
      expect(() => service.validatePaymentAmount(100.00, 120.00)).not.toThrow();
    });

    it('should throw error for zero payment amount', () => {
      expect(() => service.validatePaymentAmount(100.00, 0)).toThrow(BadRequestException);
      expect(() => service.validatePaymentAmount(100.00, 0)).toThrow('Payment amount must be greater than 0');
    });

    it('should throw error for negative payment amount', () => {
      expect(() => service.validatePaymentAmount(100.00, -10.00)).toThrow(BadRequestException);
      expect(() => service.validatePaymentAmount(100.00, -10.00)).toThrow('Payment amount must be greater than 0');
    });

    it('should throw error for excessive overpayment', () => {
      expect(() => service.validatePaymentAmount(100.00, 250.00)).toThrow(BadRequestException);
      expect(() => service.validatePaymentAmount(100.00, 250.00)).toThrow('Payment amount cannot exceed 200% of transaction total');
    });
  });

  describe('validateInventoryAvailability', () => {
    it('should validate sufficient inventory', () => {
      const items = [validTransactionItem];
      const inventoryLevels = new Map([['product-1', 10]]);
      
      expect(() => service.validateInventoryAvailability(items, inventoryLevels)).not.toThrow();
    });

    it('should throw error for insufficient inventory', () => {
      const items = [{ ...validTransactionItem, quantity: 5 }];
      const inventoryLevels = new Map([['product-1', 3]]);
      
      expect(() => service.validateInventoryAvailability(items, inventoryLevels)).toThrow(BadRequestException);
      expect(() => service.validateInventoryAvailability(items, inventoryLevels)).toThrow('Insufficient inventory');
    });

    it('should throw error for zero inventory', () => {
      const items = [validTransactionItem];
      const inventoryLevels = new Map([['product-1', 0]]);
      
      expect(() => service.validateInventoryAvailability(items, inventoryLevels)).toThrow(BadRequestException);
      expect(() => service.validateInventoryAvailability(items, inventoryLevels)).toThrow('Insufficient inventory');
    });

    it('should throw error for missing inventory data', () => {
      const items = [validTransactionItem];
      const inventoryLevels = new Map(); // Empty map
      
      expect(() => service.validateInventoryAvailability(items, inventoryLevels)).toThrow(BadRequestException);
      expect(() => service.validateInventoryAvailability(items, inventoryLevels)).toThrow('Insufficient inventory');
    });
  });

  describe('validateOfflineTransaction', () => {
    it('should validate online transaction', () => {
      const onlineDto = { ...validTransactionDto, isOfflineTransaction: false };
      
      expect(() => service.validateOfflineTransaction(onlineDto)).not.toThrow();
    });

    it('should validate offline cash transaction', () => {
      const offlineDto = { 
        ...validTransactionDto, 
        isOfflineTransaction: true,
        paymentMethod: PaymentMethod.CASH,
      };
      
      expect(() => service.validateOfflineTransaction(offlineDto)).not.toThrow();
    });

    it('should throw error for offline non-cash transaction', () => {
      const offlineDto = { 
        ...validTransactionDto, 
        isOfflineTransaction: true,
        paymentMethod: PaymentMethod.CARD,
      };
      
      expect(() => service.validateOfflineTransaction(offlineDto)).toThrow(BadRequestException);
      expect(() => service.validateOfflineTransaction(offlineDto)).toThrow('Offline transactions are only supported for cash payments');
    });

    it('should throw error for excessive offline transaction amount', () => {
      const expensiveItem = { ...validTransactionItem, unitPrice: 1001 }; // Exceeds $1000 offline limit
      const offlineDto = { 
        ...validTransactionDto, 
        items: [expensiveItem],
        isOfflineTransaction: true,
        paymentMethod: PaymentMethod.CASH,
      };
      
      expect(() => service.validateOfflineTransaction(offlineDto)).toThrow(BadRequestException);
      expect(() => service.validateOfflineTransaction(offlineDto)).toThrow('Offline transactions cannot exceed 1000');
    });
  });
});