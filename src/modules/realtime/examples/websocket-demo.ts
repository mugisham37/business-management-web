/**
 * WebSocket Gateway Demo
 * 
 * This file demonstrates how to use the RealtimeGateway and RealtimeService
 * for real-time communication in the unified business platform.
 */

import { RealtimeService } from '../services/realtime.service';

export class WebSocketDemo {
  constructor(private readonly realtimeService: RealtimeService) {}

  /**
   * Demo: Broadcasting inventory updates
   */
  async demoInventoryUpdates() {
    const tenantId = 'demo-tenant-1';
    
    // Simulate inventory level change
    await this.realtimeService.broadcastInventoryUpdate(tenantId, {
      productId: 'product-123',
      locationId: 'store-main',
      previousQuantity: 15,
      newQuantity: 12,
      changeReason: 'sale',
      changedBy: 'cashier-001',
    });

    // Simulate low stock alert
    await this.realtimeService.broadcastLowStockAlert(tenantId, {
      productId: 'product-456',
      productName: 'Premium Coffee Beans',
      locationId: 'store-main',
      locationName: 'Main Store',
      currentQuantity: 2,
      reorderPoint: 5,
      suggestedReorderQuantity: 50,
    });
  }

  /**
   * Demo: Broadcasting transaction events
   */
  async demoTransactionEvents() {
    const tenantId = 'demo-tenant-1';
    
    // Simulate new transaction
    await this.realtimeService.broadcastTransactionEvent(tenantId, {
      transactionId: 'tx-789',
      locationId: 'store-main',
      customerId: 'customer-456',
      total: 45.99,
      items: [
        { productId: 'product-123', quantity: 2, price: 15.99 },
        { productId: 'product-456', quantity: 1, price: 14.01 },
      ],
      paymentMethod: 'credit_card',
      status: 'completed',
      processedBy: 'cashier-001',
    });
  }

  /**
   * Demo: Customer activity tracking
   */
  async demoCustomerActivity() {
    const tenantId = 'demo-tenant-1';
    
    // Simulate customer loyalty points earned
    await this.realtimeService.broadcastCustomerActivity(tenantId, {
      customerId: 'customer-456',
      activityType: 'loyalty_earned',
      details: {
        pointsEarned: 45,
        totalPoints: 1245,
        transactionId: 'tx-789',
      },
      locationId: 'store-main',
    });

    // Simulate customer profile update
    await this.realtimeService.broadcastCustomerActivity(tenantId, {
      customerId: 'customer-456',
      activityType: 'profile_updated',
      details: {
        fieldsUpdated: ['phone', 'address'],
        updatedBy: 'customer-456',
      },
    });
  }

  /**
   * Demo: System notifications
   */
  async demoNotifications() {
    const tenantId = 'demo-tenant-1';
    
    // Send info notification
    await this.realtimeService.sendNotification(tenantId, {
      id: 'notif-001',
      type: 'info',
      title: 'Daily Sales Report Ready',
      message: 'Your daily sales report for today is now available in the reports section.',
      priority: 'medium',
      targetUsers: ['manager-001', 'owner-001'],
    });

    // Send warning notification
    await this.realtimeService.sendNotification(tenantId, {
      id: 'notif-002',
      type: 'warning',
      title: 'Multiple Low Stock Items',
      message: '5 products are running low on stock and need to be reordered.',
      priority: 'high',
    });

    // Send system alert
    await this.realtimeService.sendSystemAlert(tenantId, {
      type: 'maintenance',
      title: 'Scheduled Maintenance',
      message: 'System maintenance is scheduled for tonight from 2:00 AM to 4:00 AM.',
      severity: 'info',
      scheduledTime: new Date('2024-01-15T02:00:00Z'),
      estimatedDuration: 120, // minutes
    });
  }

  /**
   * Demo: Sales milestones
   */
  async demoSalesMilestones() {
    const tenantId = 'demo-tenant-1';
    
    // Daily target achieved
    await this.realtimeService.broadcastSalesMilestone(tenantId, {
      type: 'daily_target',
      title: 'Daily Sales Target Achieved!',
      description: 'Congratulations! You have reached your daily sales target.',
      value: 2500,
      target: 2500,
      locationId: 'store-main',
      achievedBy: 'team-main-store',
    });

    // Revenue milestone
    await this.realtimeService.broadcastSalesMilestone(tenantId, {
      type: 'revenue_milestone',
      title: '$10,000 Monthly Revenue Milestone',
      description: 'Amazing work! You have crossed the $10,000 monthly revenue mark.',
      value: 10000,
      target: 10000,
    });
  }

  /**
   * Demo: Connection monitoring
   */
  demoConnectionMonitoring() {
    // Get real-time connection statistics
    const stats = this.realtimeService.getConnectionStatistics();
    console.log('Connection Statistics:', {
      totalConnections: stats.connectedClients,
      tenantRooms: stats.tenantRooms,
      lastHealthCheck: stats.lastHealthCheck,
    });

    // Check if tenant has active connections
    const tenantId = 'demo-tenant-1';
    const hasConnections = this.realtimeService.hasTenantConnections(tenantId);
    const connectionCount = this.realtimeService.getTenantConnectionCount(tenantId);
    
    console.log(`Tenant ${tenantId}:`, {
      hasActiveConnections: hasConnections,
      connectionCount: connectionCount,
    });

    // Get detailed tenant connections
    const connections = this.realtimeService.getTenantConnections(tenantId);
    console.log('Active Connections:', connections.map(conn => ({
      userId: conn.user.id,
      displayName: conn.user.displayName,
      connectedAt: conn.connectedAt,
      roomCount: conn.rooms.size,
    })));
  }
}

/**
 * Client-side WebSocket connection example
 * 
 * This shows how a frontend client would connect to the WebSocket gateway
 */
export const clientConnectionExample = `
// Frontend JavaScript/TypeScript example
import { io } from 'socket.io-client';

// Connect to the WebSocket server
const socket = io('ws://localhost:3000/realtime', {
  auth: {
    token: 'your-jwt-token-here'
  }
});

// Handle connection events
socket.on('connected', (data) => {
  console.log('Connected to real-time service:', data);
});

socket.on('auth_error', (error) => {
  console.error('Authentication failed:', error);
});

// Subscribe to inventory updates for a specific location
socket.emit('subscribe_inventory', { locationId: 'store-main' });

// Subscribe to all transactions for the tenant
socket.emit('subscribe_transactions', {});

// Subscribe to customer activity for a specific customer
socket.emit('subscribe_customer_activity', { customerId: 'customer-123' });

// Handle real-time events
socket.on('inventory_updated', (data) => {
  console.log('Inventory updated:', data);
  // Update UI with new inventory levels
});

socket.on('transaction_created', (data) => {
  console.log('New transaction:', data);
  // Update sales dashboard
});

socket.on('customer_activity', (data) => {
  console.log('Customer activity:', data);
  // Update customer profile or activity feed
});

socket.on('notification', (data) => {
  console.log('New notification:', data);
  // Show notification to user
});

socket.on('low_stock_alert', (data) => {
  console.log('Low stock alert:', data);
  // Show urgent notification for low stock
});

socket.on('sales_milestone', (data) => {
  console.log('Sales milestone achieved:', data);
  // Show celebration or achievement notification
});

// Health check
socket.emit('health_check');
socket.on('health_status', (status) => {
  console.log('Connection health:', status);
});

// Unsubscribe from a room
socket.emit('unsubscribe', { room: 'inventory:tenant-1:store-main' });

// Handle disconnection
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});
`;

/**
 * Usage examples for different business scenarios
 */
export const businessScenarios = {
  
  /**
   * Point of Sale Integration
   */
  posIntegration: `
  // When a sale is completed in the POS system
  async onSaleCompleted(transaction) {
    // Broadcast transaction event
    await realtimeService.broadcastTransactionEvent(tenantId, {
      transactionId: transaction.id,
      locationId: transaction.locationId,
      customerId: transaction.customerId,
      total: transaction.total,
      items: transaction.items,
      paymentMethod: transaction.paymentMethod,
      status: 'completed',
      processedBy: transaction.cashierId,
    });

    // Update inventory levels for each item
    for (const item of transaction.items) {
      await realtimeService.broadcastInventoryUpdate(tenantId, {
        productId: item.productId,
        locationId: transaction.locationId,
        previousQuantity: item.previousStock,
        newQuantity: item.previousStock - item.quantity,
        changeReason: 'sale',
        changedBy: transaction.cashierId,
      });
    }

    // Check for sales milestones
    if (await checkDailyTarget(transaction.locationId)) {
      await realtimeService.broadcastSalesMilestone(tenantId, {
        type: 'daily_target',
        title: 'Daily Target Achieved!',
        description: 'Great work reaching your daily sales goal.',
        value: await getDailySales(transaction.locationId),
        target: await getDailyTarget(transaction.locationId),
        locationId: transaction.locationId,
      });
    }
  }
  `,

  /**
   * Inventory Management Integration
   */
  inventoryIntegration: `
  // When inventory is restocked
  async onInventoryRestock(restock) {
    await realtimeService.broadcastInventoryUpdate(tenantId, {
      productId: restock.productId,
      locationId: restock.locationId,
      previousQuantity: restock.previousQuantity,
      newQuantity: restock.newQuantity,
      changeReason: 'restock',
      changedBy: restock.employeeId,
    });

    // Send notification if this resolves a low stock situation
    if (restock.previousQuantity <= restock.reorderPoint) {
      await realtimeService.sendNotification(tenantId, {
        id: generateId(),
        type: 'success',
        title: 'Low Stock Resolved',
        message: \`\${restock.productName} has been restocked at \${restock.locationName}\`,
        priority: 'medium',
      });
    }
  }

  // When stock falls below reorder point
  async onLowStock(product, location, currentQuantity) {
    await realtimeService.broadcastLowStockAlert(tenantId, {
      productId: product.id,
      productName: product.name,
      locationId: location.id,
      locationName: location.name,
      currentQuantity,
      reorderPoint: product.reorderPoint,
      suggestedReorderQuantity: product.reorderQuantity,
    });
  }
  `,

  /**
   * Customer Management Integration
   */
  customerIntegration: `
  // When customer earns loyalty points
  async onLoyaltyPointsEarned(customer, points, transaction) {
    await realtimeService.broadcastCustomerActivity(tenantId, {
      customerId: customer.id,
      activityType: 'loyalty_earned',
      details: {
        pointsEarned: points,
        totalPoints: customer.totalPoints + points,
        transactionId: transaction.id,
      },
      locationId: transaction.locationId,
    });
  }

  // When customer redeems rewards
  async onRewardRedeemed(customer, reward, transaction) {
    await realtimeService.broadcastCustomerActivity(tenantId, {
      customerId: customer.id,
      activityType: 'loyalty_redeemed',
      details: {
        rewardName: reward.name,
        pointsUsed: reward.pointsCost,
        remainingPoints: customer.totalPoints - reward.pointsCost,
        transactionId: transaction.id,
      },
      locationId: transaction.locationId,
    });
  }
  `,
};