/**
 * 🔗 EXAMPLE: INTEGRATING SECURITY INTO OTHER MODULES
 * 
 * This example shows how to add security to any existing module
 * with minimal changes and maximum benefit.
 */

// ============================================================================
// 📦 EXAMPLE: PRODUCT MODULE WITH SECURITY
// ============================================================================

import { Module } from '@nestjs/common';
import { SecurityModule, SecurityFacade } from '../src/modules/security';

@Module({
  imports: [
    SecurityModule, // 🔒 Import security module
    // ... other imports
  ],
  providers: [
    ProductService,
    ProductResolver,
    // Security is automatically available via dependency injection
  ],
})
export class ProductModule {}

// ============================================================================
// 🛍️ PRODUCT SERVICE WITH SECURITY
// ============================================================================

import { Injectable } from '@nestjs/common';
import { SecurityFacade, SecureOperation } from '../src/modules/security';

@Injectable()
export class ProductService {
  constructor(
    private readonly security: SecurityFacade, // 🔒 Inject security facade
    // ... other dependencies
  ) {}

  async createProduct(productData: any, userId: string, tenantId: string): Promise<any> {
    // 🔐 Encrypt sensitive product data
    if (productData.cost) {
      productData.encryptedCost = await this.security.encrypt(
        productData.cost.toString(),
        tenantId,
        'product_cost'
      );
      delete productData.cost; // Remove plain text cost
    }

    // Create product
    const product = await this.saveProduct(productData);

    // 📝 Log the creation for audit trail
    await this.security.logUserAction(
      userId,
      tenantId,
      'create',
      'product',
      product.id,
      undefined,
      this.security.maskSensitiveData(productData),
      { category: 'inventory', action: 'product_created' }
    );

    return product;
  }

  async getProductCost(productId: string, tenantId: string): Promise<number> {
    const product = await this.findProduct(productId);
    
    if (product.encryptedCost) {
      // 🔓 Decrypt sensitive data
      const decryptedCost = await this.security.decrypt(
        product.encryptedCost,
        tenantId,
        'product_cost'
      );
      return parseFloat(decryptedCost);
    }

    return 0;
  }

  private async saveProduct(data: any): Promise<any> {
    // Your existing product save logic
    return { id: 'product_123', ...data };
  }

  private async findProduct(id: string): Promise<any> {
    // Your existing product find logic
    return { id, encryptedCost: 'encrypted_data_here' };
  }
}

// ============================================================================
// 🌐 PRODUCT RESOLVER WITH SECURITY
// ============================================================================

import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { 
  SecureOperation, 
  DataProtection, 
  ThreatMonitoring,
  AuditLog 
} from '../src/modules/security';

@Resolver()
@UseGuards(JwtAuthGuard)
export class ProductResolver {
  constructor(
    private readonly productService: ProductService,
    private readonly security: SecurityFacade, // 🔒 Security facade available
  ) {}

  @Query(() => [Object])
  @SecureOperation({ level: 'low', auditCategory: 'inventory' })
  async getProducts(@CurrentTenant() tenantId: string): Promise<any[]> {
    // ✅ Automatically secured with audit logging and threat detection
    return await this.productService.getProducts(tenantId);
  }

  @Query(() => Object)
  @DataProtection('confidential') // 🔐 Sensitive financial data
  async getProductCost(
    @Args('productId') productId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    // ✅ Automatically gets data classification enforcement
    const cost = await this.productService.getProductCost(productId, tenantId);
    return { productId, cost };
  }

  @Mutation(() => Object)
  @ThreatMonitoring('medium') // 🚨 Monitor for unusual product creation patterns
  async createProduct(
    @Args('productData') productData: any,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    // ✅ Automatically gets behavioral analysis and threat detection
    
    // Check for suspicious activity
    const behaviorAnalysis = await this.security.analyzeBehavior(user.id, tenantId);
    const suspiciousActivity = behaviorAnalysis.filter(a => 
      a.type === 'rapid_data_creation' && a.confidence > 70
    );

    if (suspiciousActivity.length > 0) {
      await this.security.logSecurityEvent('suspicious_product_creation', {
        tenantId,
        userId: user.id,
        resource: 'product',
        metadata: { suspiciousActivities: suspiciousActivity },
      });
    }

    return await this.productService.createProduct(productData, user.id, tenantId);
  }

  @Mutation(() => Boolean)
  @AuditLog('inventory', 'product_deletion')
  async deleteProduct(
    @Args('productId') productId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    // ✅ Automatically gets audit logging
    
    // Additional security check for high-value products
    const cost = await this.productService.getProductCost(productId, tenantId);
    if (cost > 10000) {
      // Log high-value deletion
      await this.security.logSecurityEvent('high_value_product_deletion', {
        tenantId,
        userId: user.id,
        resource: 'product',
        resourceId: productId,
        metadata: { cost, deletedBy: user.id },
      });
    }

    return await this.productService.deleteProduct(productId, user.id, tenantId);
  }
}

// ============================================================================
// 💰 EXAMPLE: FINANCIAL MODULE WITH ENHANCED SECURITY
// ============================================================================

@Injectable()
export class FinancialService {
  constructor(private readonly security: SecurityFacade) {}

  async processPayment(paymentData: any, userId: string, tenantId: string): Promise<any> {
    // 🔐 Encrypt all sensitive financial data
    const encryptedPayment = {
      ...paymentData,
      cardNumber: await this.security.encrypt(paymentData.cardNumber, tenantId, 'card_number'),
      cvv: await this.security.encrypt(paymentData.cvv, tenantId, 'cvv'),
      amount: await this.security.encrypt(paymentData.amount.toString(), tenantId, 'amount'),
    };

    // Remove plain text sensitive data
    delete encryptedPayment.cardNumber;
    delete encryptedPayment.cvv;

    // Process payment
    const result = await this.processPaymentInternal(encryptedPayment);

    // 📝 Log financial transaction (with masked data)
    await this.security.logUserAction(
      userId,
      tenantId,
      'create',
      'payment',
      result.id,
      undefined,
      this.security.maskSensitiveData(paymentData),
      { 
        category: 'financial',
        transactionType: 'payment',
        amount: paymentData.amount,
        currency: paymentData.currency,
      }
    );

    return result;
  }

  private async processPaymentInternal(data: any): Promise<any> {
    // Your payment processing logic
    return { id: 'payment_123', status: 'completed' };
  }
}

@Resolver()
export class FinancialResolver {
  constructor(
    private readonly financialService: FinancialService,
    private readonly security: SecurityFacade,
  ) {}

  @Mutation(() => Object)
  @DataProtection('restricted') // 🔒 Highest security for financial data
  @ComplianceRequired(['PCI_DSS', 'SOC2']) // 📋 Financial compliance required
  async processPayment(
    @Args('paymentData') paymentData: any,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    // ✅ Maximum security: encryption, compliance, audit, threat detection
    
    // Additional security: Check if user account is compromised
    const isCompromised = await this.security.isUserCompromised(user.id, tenantId);
    if (isCompromised) {
      throw new Error('Payment blocked: account security concerns detected');
    }

    return await this.financialService.processPayment(paymentData, user.id, tenantId);
  }

  @Query(() => Object)
  @DataProtection('restricted')
  @ThreatMonitoring('critical') // 🚨 Critical monitoring for financial queries
  async getFinancialReport(
    @Args('reportType') reportType: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    // ✅ Critical threat monitoring for sensitive financial data access
    
    // Get compliance status before providing financial data
    const complianceStatus = await this.security.getComplianceStatus(tenantId);
    if (complianceStatus.overallScore < 80) {
      throw new Error('Financial reports unavailable: compliance requirements not met');
    }

    return await this.financialService.generateReport(reportType, tenantId);
  }
}

// ============================================================================
// 👥 EXAMPLE: USER MANAGEMENT MODULE WITH GDPR COMPLIANCE
// ============================================================================

@Injectable()
export class UserManagementService {
  constructor(private readonly security: SecurityFacade) {}

  async exportUserData(userId: string, tenantId: string): Promise<any> {
    // 📋 Use built-in GDPR export functionality
    return await this.security.exportUserData(tenantId, userId);
  }

  async deleteUserData(userId: string, tenantId: string, reason: string): Promise<void> {
    // 🗑️ GDPR-compliant data deletion
    await this.security.deleteUserData(tenantId, userId);
    
    // Log the deletion
    await this.security.logSecurityEvent('gdpr_user_deletion', {
      tenantId,
      resource: 'user_data',
      resourceId: userId,
      metadata: { reason, deletionType: 'gdpr_compliance' },
    });
  }
}

@Resolver()
export class UserManagementResolver {
  constructor(
    private readonly userService: UserManagementService,
    private readonly security: SecurityFacade,
  ) {}

  @Query(() => Object)
  @ComplianceRequired(['GDPR']) // 📋 GDPR compliance required
  async exportMyData(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    // ✅ GDPR-compliant data export with automatic compliance checking
    return await this.userService.exportUserData(user.id, tenantId);
  }

  @Mutation(() => Boolean)
  @HighRiskOperation('gdpr_compliance') // 🚨 Maximum security for data deletion
  async deleteMyData(
    @Args('confirmationCode') confirmationCode: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    // ✅ Maximum security with MFA, audit, compliance, and threat detection
    
    // Verify confirmation code (your logic here)
    if (!this.verifyConfirmationCode(confirmationCode, user.id)) {
      throw new Error('Invalid confirmation code');
    }

    await this.userService.deleteUserData(user.id, tenantId, 'user_request');
    return true;
  }

  private verifyConfirmationCode(code: string, userId: string): boolean {
    // Your confirmation code verification logic
    return true;
  }
}

/**
 * 🎯 INTEGRATION SUMMARY
 * 
 * By importing SecurityModule and using SecurityFacade, any module gets:
 * 
 * ✅ AUTOMATIC FEATURES:
 * - Audit logging for all operations
 * - Real-time threat detection
 * - Behavioral analysis
 * - Compliance framework checking
 * - Security monitoring and alerting
 * 
 * 🔧 EASY-TO-USE METHODS:
 * - encrypt() / decrypt() - Data encryption
 * - logUserAction() - Audit logging
 * - isUserCompromised() - Threat detection
 * - getComplianceStatus() - Compliance checking
 * - exportUserData() / deleteUserData() - GDPR compliance
 * 
 * 🎨 POWERFUL DECORATORS:
 * - @SecureOperation() - Basic security
 * - @HighRiskOperation() - Maximum security
 * - @DataProtection() - Data classification
 * - @ComplianceRequired() - Compliance enforcement
 * - @ThreatMonitoring() - Behavioral analysis
 * 
 * 🚀 ZERO CONFIGURATION:
 * - Just import SecurityModule
 * - Inject SecurityFacade
 * - Add decorators
 * - Use security methods
 * - Everything else is automatic!
 */