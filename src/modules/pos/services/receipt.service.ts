import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailReceiptService } from './email-receipt.service';
import { SmsReceiptService } from './sms-receipt.service';
import { PrintReceiptService } from './print-receipt.service';
import { TransactionWithItems } from '../entities/transaction.entity';

export interface ReceiptOptions {
  format: 'email' | 'sms' | 'print';
  recipient?: string; // email address or phone number
  template?: string;
  includeItemDetails?: boolean;
  includeTaxBreakdown?: boolean;
}

export interface ReceiptResult {
  success: boolean;
  receiptId: string;
  deliveryMethod: string;
  error?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class ReceiptService {
  private readonly logger = new Logger(ReceiptService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly emailService: EmailReceiptService,
    private readonly smsService: SmsReceiptService,
    private readonly printService: PrintReceiptService,
  ) {}

  async generateReceipt(
    transaction: TransactionWithItems,
    options: ReceiptOptions,
  ): Promise<ReceiptResult> {
    this.logger.log(`Generating ${options.format} receipt for transaction ${transaction.transactionNumber}`);

    try {
      const receiptContent = await this.buildReceiptContent(transaction, options);
      
      switch (options.format) {
        case 'email':
          return await this.emailService.sendReceiptEmail(receiptContent, transaction, {
            to: options.recipient!,
            template: options.template,
            includeItemDetails: options.includeItemDetails,
            includeTaxBreakdown: options.includeTaxBreakdown,
          });
        case 'sms':
          return await this.smsService.sendReceiptSms(receiptContent, transaction, {
            to: options.recipient!,
            template: options.template as any,
            includeTotal: true,
            includeItems: options.includeItemDetails,
          });
        case 'print':
          return await this.printService.printReceipt(receiptContent, transaction, {
            template: options.template as any,
            includeBarcode: true,
            includeQrCode: false,
            cutPaper: true,
            openDrawer: false,
          });
        default:
          throw new Error(`Unsupported receipt format: ${options.format}`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Receipt generation failed: ${errorMessage}`);
      
      return {
        success: false,
        receiptId: '',
        deliveryMethod: options.format,
        error: errorMessage,
      };
    }
  }

  async generateMultipleReceipts(
    transaction: TransactionWithItems,
    optionsArray: ReceiptOptions[],
  ): Promise<ReceiptResult[]> {
    const results: ReceiptResult[] = [];
    
    for (const options of optionsArray) {
      const result = await this.generateReceipt(transaction, options);
      results.push(result);
    }
    
    return results;
  }

  async getAvailablePrinters() {
    return this.printService.getAvailablePrinters();
  }

  async openCashDrawer(printerName?: string) {
    return this.printService.openCashDrawer(printerName);
  }

  private async buildReceiptContent(
    transaction: TransactionWithItems,
    options: ReceiptOptions,
  ): Promise<string> {
    const template = options.template || 'standard';
    
    switch (template) {
      case 'standard':
        return this.buildStandardReceipt(transaction, options);
      case 'minimal':
        return this.buildMinimalReceipt(transaction, options);
      case 'detailed':
        return this.buildDetailedReceipt(transaction, options);
      default:
        return this.buildStandardReceipt(transaction, options);
    }
  }

  private buildStandardReceipt(
    transaction: TransactionWithItems,
    options: ReceiptOptions,
  ): string {
    const lines: string[] = [];
    
    // Header
    lines.push('================================');
    lines.push('         RECEIPT');
    lines.push('================================');
    lines.push('');
    
    // Transaction info
    lines.push(`Transaction #: ${transaction.transactionNumber}`);
    lines.push(`Date: ${transaction.createdAt.toLocaleDateString()}`);
    lines.push(`Time: ${transaction.createdAt.toLocaleTimeString()}`);
    lines.push(`Location: ${transaction.locationId}`);
    lines.push('');
    
    // Items
    if (options.includeItemDetails !== false) {
      lines.push('ITEMS:');
      lines.push('--------------------------------');
      
      for (const item of transaction.items) {
        const itemLine = `${item.productName}`;
        const qtyPrice = `${item.quantity} x $${item.unitPrice.toFixed(2)}`;
        const total = `$${item.lineTotal.toFixed(2)}`;
        
        lines.push(itemLine);
        lines.push(`  ${qtyPrice.padEnd(20)} ${total.padStart(10)}`);
        
        if (item.discountAmount > 0) {
          lines.push(`  Discount: -$${item.discountAmount.toFixed(2)}`);
        }
      }
      
      lines.push('');
    }
    
    // Totals
    lines.push('TOTALS:');
    lines.push('--------------------------------');
    lines.push(`Subtotal:${('$' + transaction.subtotal.toFixed(2)).padStart(24)}`);
    
    if (transaction.discountAmount > 0) {
      lines.push(`Discount:${('-$' + transaction.discountAmount.toFixed(2)).padStart(24)}`);
    }
    
    if (options.includeTaxBreakdown !== false && transaction.taxAmount > 0) {
      lines.push(`Tax:${('$' + transaction.taxAmount.toFixed(2)).padStart(29)}`);
    }
    
    if (transaction.tipAmount > 0) {
      lines.push(`Tip:${('$' + transaction.tipAmount.toFixed(2)).padStart(29)}`);
    }
    
    lines.push('--------------------------------');
    lines.push(`TOTAL:${('$' + transaction.total.toFixed(2)).padStart(26)}`);
    lines.push('');
    
    // Payment info
    lines.push(`Payment Method: ${transaction.paymentMethod.toUpperCase()}`);
    lines.push(`Status: ${transaction.status.toUpperCase()}`);
    lines.push('');
    
    // Footer
    lines.push('Thank you for your business!');
    lines.push('================================');
    
    return lines.join('\n');
  }

  private buildMinimalReceipt(
    transaction: TransactionWithItems,
    options: ReceiptOptions,
  ): string {
    const lines: string[] = [];
    
    lines.push(`Receipt: ${transaction.transactionNumber}`);
    lines.push(`Date: ${transaction.createdAt.toLocaleDateString()}`);
    lines.push(`Total: $${transaction.total.toFixed(2)}`);
    lines.push(`Payment: ${transaction.paymentMethod.toUpperCase()}`);
    lines.push('Thank you!');
    
    return lines.join('\n');
  }

  private buildDetailedReceipt(
    transaction: TransactionWithItems,
    options: ReceiptOptions,
  ): string {
    // Build a more detailed receipt with additional information
    const standardReceipt = this.buildStandardReceipt(transaction, options);
    
    const additionalLines: string[] = [];
    additionalLines.push('');
    additionalLines.push('ADDITIONAL DETAILS:');
    additionalLines.push('--------------------------------');
    additionalLines.push(`Transaction ID: ${transaction.id}`);
    additionalLines.push(`Tenant ID: ${transaction.tenantId}`);
    
    if (transaction.customerId) {
      additionalLines.push(`Customer ID: ${transaction.customerId}`);
    }
    
    additionalLines.push(`Items Count: ${transaction.itemCount}`);
    additionalLines.push(`Created By: ${transaction.createdBy || 'System'}`);
    
    if (transaction.notes) {
      additionalLines.push('');
      additionalLines.push('NOTES:');
      additionalLines.push(transaction.notes);
    }
    
    return standardReceipt + '\n' + additionalLines.join('\n');
  }
}