import type {
  Supplier,
} from '@/types/supplier';
import {
  SupplierStatus,
  SupplierType,
  SupplierRating,
  PurchaseOrderStatus,
  PurchaseOrderPriority,
  CommunicationType,
  CommunicationDirection,
  PaymentTerms,
} from '@/types/supplier';

/**
 * Supplier utility functions
 */

// Status helpers
export function getSupplierStatusColor(status: SupplierStatus): string {
  const statusColors: Record<SupplierStatus, string> = {
    [SupplierStatus.ACTIVE]: 'green',
    [SupplierStatus.INACTIVE]: 'gray',
    [SupplierStatus.PENDING_APPROVAL]: 'yellow',
    [SupplierStatus.SUSPENDED]: 'orange',
    [SupplierStatus.BLACKLISTED]: 'red',
  };
  return statusColors[status] || 'gray';
}

export function getSupplierStatusLabel(status: SupplierStatus): string {
  const statusLabels: Record<SupplierStatus, string> = {
    [SupplierStatus.ACTIVE]: 'Active',
    [SupplierStatus.INACTIVE]: 'Inactive',
    [SupplierStatus.PENDING_APPROVAL]: 'Pending Approval',
    [SupplierStatus.SUSPENDED]: 'Suspended',
    [SupplierStatus.BLACKLISTED]: 'Blacklisted',
  };
  return statusLabels[status] || status;
}

export function getSupplierTypeLabel(type: SupplierType): string {
  const typeLabels: Record<SupplierType, string> = {
    [SupplierType.MANUFACTURER]: 'Manufacturer',
    [SupplierType.DISTRIBUTOR]: 'Distributor',
    [SupplierType.WHOLESALER]: 'Wholesaler',
    [SupplierType.SERVICE_PROVIDER]: 'Service Provider',
    [SupplierType.CONTRACTOR]: 'Contractor',
    [SupplierType.CONSULTANT]: 'Consultant',
  };
  return typeLabels[type] || type;
}

export function getSupplierRatingColor(rating: SupplierRating): string {
  const ratingColors: Record<SupplierRating, string> = {
    [SupplierRating.EXCELLENT]: 'green',
    [SupplierRating.GOOD]: 'blue',
    [SupplierRating.AVERAGE]: 'yellow',
    [SupplierRating.POOR]: 'red',
    [SupplierRating.UNRATED]: 'gray',
  };
  return ratingColors[rating] || 'gray';
}

export function getSupplierRatingLabel(rating: SupplierRating): string {
  const ratingLabels: Record<SupplierRating, string> = {
    [SupplierRating.EXCELLENT]: 'Excellent',
    [SupplierRating.GOOD]: 'Good',
    [SupplierRating.AVERAGE]: 'Average',
    [SupplierRating.POOR]: 'Poor',
    [SupplierRating.UNRATED]: 'Unrated',
  };
  return ratingLabels[rating] || rating;
}

// Purchase Order helpers
export function getPurchaseOrderStatusColor(status: PurchaseOrderStatus): string {
  const statusColors: Record<PurchaseOrderStatus, string> = {
    [PurchaseOrderStatus.DRAFT]: 'gray',
    [PurchaseOrderStatus.PENDING_APPROVAL]: 'yellow',
    [PurchaseOrderStatus.APPROVED]: 'blue',
    [PurchaseOrderStatus.SENT_TO_SUPPLIER]: 'purple',
    [PurchaseOrderStatus.ACKNOWLEDGED]: 'indigo',
    [PurchaseOrderStatus.PARTIALLY_RECEIVED]: 'orange',
    [PurchaseOrderStatus.FULLY_RECEIVED]: 'green',
    [PurchaseOrderStatus.CANCELLED]: 'red',
    [PurchaseOrderStatus.CLOSED]: 'gray',
  };
  return statusColors[status] || 'gray';
}

export function getPurchaseOrderStatusLabel(status: PurchaseOrderStatus): string {
  const statusLabels: Record<PurchaseOrderStatus, string> = {
    [PurchaseOrderStatus.DRAFT]: 'Draft',
    [PurchaseOrderStatus.PENDING_APPROVAL]: 'Pending Approval',
    [PurchaseOrderStatus.APPROVED]: 'Approved',
    [PurchaseOrderStatus.SENT_TO_SUPPLIER]: 'Sent to Supplier',
    [PurchaseOrderStatus.ACKNOWLEDGED]: 'Acknowledged',
    [PurchaseOrderStatus.PARTIALLY_RECEIVED]: 'Partially Received',
    [PurchaseOrderStatus.FULLY_RECEIVED]: 'Fully Received',
    [PurchaseOrderStatus.CANCELLED]: 'Cancelled',
    [PurchaseOrderStatus.CLOSED]: 'Closed',
  };
  return statusLabels[status] || status;
}

export function getPurchaseOrderPriorityColor(priority: PurchaseOrderPriority): string {
  const priorityColors: Record<PurchaseOrderPriority, string> = {
    [PurchaseOrderPriority.LOW]: 'green',
    [PurchaseOrderPriority.NORMAL]: 'blue',
    [PurchaseOrderPriority.HIGH]: 'orange',
    [PurchaseOrderPriority.URGENT]: 'red',
  };
  return priorityColors[priority] || 'blue';
}

export function getPurchaseOrderPriorityLabel(priority: PurchaseOrderPriority): string {
  const priorityLabels: Record<PurchaseOrderPriority, string> = {
    [PurchaseOrderPriority.LOW]: 'Low',
    [PurchaseOrderPriority.NORMAL]: 'Normal',
    [PurchaseOrderPriority.HIGH]: 'High',
    [PurchaseOrderPriority.URGENT]: 'Urgent',
  };
  return priorityLabels[priority] || priority;
}

// Communication helpers
export function getCommunicationTypeIcon(type: CommunicationType): string {
  const typeIcons: Record<CommunicationType, string> = {
    [CommunicationType.EMAIL]: '📧',
    [CommunicationType.PHONE]: '📞',
    [CommunicationType.MEETING]: '🤝',
    [CommunicationType.VIDEO_CALL]: '📹',
    [CommunicationType.CHAT]: '💬',
    [CommunicationType.LETTER]: '✉️',
    [CommunicationType.FAX]: '📠',
  };
  return typeIcons[type] || '📄';
}

export function getCommunicationTypeLabel(type: CommunicationType): string {
  const typeLabels: Record<CommunicationType, string> = {
    [CommunicationType.EMAIL]: 'Email',
    [CommunicationType.PHONE]: 'Phone',
    [CommunicationType.MEETING]: 'Meeting',
    [CommunicationType.VIDEO_CALL]: 'Video Call',
    [CommunicationType.CHAT]: 'Chat',
    [CommunicationType.LETTER]: 'Letter',
    [CommunicationType.FAX]: 'Fax',
  };
  return typeLabels[type] || type;
}

export function getCommunicationDirectionColor(direction: CommunicationDirection): string {
  const directionColors: Record<CommunicationDirection, string> = {
    [CommunicationDirection.INBOUND]: 'blue',
    [CommunicationDirection.OUTBOUND]: 'green',
  };
  return directionColors[direction] || 'gray';
}

export function getCommunicationDirectionLabel(direction: CommunicationDirection): string {
  const directionLabels: Record<CommunicationDirection, string> = {
    [CommunicationDirection.INBOUND]: 'Inbound',
    [CommunicationDirection.OUTBOUND]: 'Outbound',
  };
  return directionLabels[direction] || direction;
}

// Payment terms helpers
export function getPaymentTermsLabel(terms: PaymentTerms): string {
  const termsLabels: Record<PaymentTerms, string> = {
    [PaymentTerms.NET_30]: 'Net 30',
    [PaymentTerms.NET_60]: 'Net 60',
    [PaymentTerms.NET_90]: 'Net 90',
    [PaymentTerms.COD]: 'Cash on Delivery',
    [PaymentTerms.PREPAID]: 'Prepaid',
    [PaymentTerms.CUSTOM]: 'Custom',
  };
  return termsLabels[terms] || terms;
}

// Supplier validation helpers
export function validateSupplierCode(code: string): boolean {
  // Supplier code should be 3-50 characters, alphanumeric with hyphens/underscores
  const regex = /^[A-Za-z0-9_-]{3,50}$/;
  return regex.test(code);
}

export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validatePhone(phone: string): boolean {
  // Basic phone validation - allows various formats
  const regex = /^[\+]?[1-9][\d]{0,15}$/;
  return regex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

export function validateWebsite(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Supplier formatting helpers
export function formatSupplierName(supplier: Supplier): string {
  return supplier.name || supplier.supplierCode;
}

export function formatSupplierAddress(supplier: Supplier): string {
  const parts = [
    supplier.addressLine1,
    supplier.addressLine2,
    supplier.city,
    supplier.state,
    supplier.postalCode,
    supplier.country,
  ].filter(Boolean);
  
  return parts.join(', ');
}

export function formatSupplierContact(supplier: Supplier): string {
  if (supplier.primaryContactName) {
    const parts = [supplier.primaryContactName];
    if (supplier.primaryContactTitle) {
      parts.push(`(${supplier.primaryContactTitle})`);
    }
    return parts.join(' ');
  }
  return supplier.primaryContactEmail || supplier.primaryContactPhone || 'No contact info';
}

// Performance calculation helpers
export function calculateOnTimeDeliveryRate(
  onTimeDeliveries: number,
  totalDeliveries: number
): number {
  if (totalDeliveries === 0) return 0;
  return Math.round((onTimeDeliveries / totalDeliveries) * 100);
}

export function calculateDefectRate(
  defectiveItems: number,
  totalItems: number
): number {
  if (totalItems === 0) return 0;
  return Math.round((defectiveItems / totalItems) * 100);
}

export function calculateAverageLeadTime(leadTimes: number[]): number {
  if (leadTimes.length === 0) return 0;
  const sum = leadTimes.reduce((acc, time) => acc + time, 0);
  return Math.round(sum / leadTimes.length);
}

// Score calculation helpers
export function calculateOverallScore(scores: {
  quality?: number;
  delivery?: number;
  pricing?: number;
  service?: number;
  reliability?: number;
  compliance?: number;
}): number {
  const validScores = Object.values(scores).filter(
    score => typeof score === 'number' && score >= 0
  );
  
  if (validScores.length === 0) return 0;
  
  const sum = validScores.reduce((acc, score) => acc + score, 0);
  return Math.round(sum / validScores.length);
}

export function getScoreGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'green';
  if (score >= 80) return 'blue';
  if (score >= 70) return 'yellow';
  if (score >= 60) return 'orange';
  return 'red';
}

// Date helpers for supplier module
export function isOverdue(date: Date | string): boolean {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  return targetDate < new Date();
}

export function getDaysUntilDue(date: Date | string): number {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatDaysUntilDue(date: Date | string): string {
  const days = getDaysUntilDue(date);
  
  if (days < 0) {
    return `${Math.abs(days)} days overdue`;
  } else if (days === 0) {
    return 'Due today';
  } else if (days === 1) {
    return 'Due tomorrow';
  } else {
    return `Due in ${days} days`;
  }
}

// Search and filter helpers
export function searchSuppliers(
  suppliers: Supplier[],
  searchTerm: string
): Supplier[] {
  if (!searchTerm.trim()) return suppliers;
  
  const term = searchTerm.toLowerCase();
  
  return suppliers.filter(supplier => {
    const searchableText = [
      supplier.supplierCode,
      supplier.name,
      supplier.legalName,
      supplier.primaryContactName,
      supplier.primaryContactEmail,
      supplier.city,
      supplier.country,
      ...(supplier.tags || []),
    ].join(' ').toLowerCase();
    
    return searchableText.includes(term);
  });
}

export function sortSuppliers(
  suppliers: Supplier[],
  sortBy: string,
  sortOrder: 'asc' | 'desc' = 'asc'
): Supplier[] {
  const sorted = [...suppliers].sort((a, b) => {
    let aValue: string | Date | number;
    let bValue: string | Date | number;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name?.toLowerCase() || '';
        bValue = b.name?.toLowerCase() || '';
        break;
      case 'supplierCode':
        aValue = a.supplierCode?.toLowerCase() || '';
        bValue = b.supplierCode?.toLowerCase() || '';
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'updatedAt':
        aValue = new Date(a.updatedAt);
        bValue = new Date(b.updatedAt);
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  
  return sorted;
}

// Export helpers for easy access
export const supplierUtils = {
  // Status helpers
  getSupplierStatusColor,
  getSupplierStatusLabel,
  getSupplierTypeLabel,
  getSupplierRatingColor,
  getSupplierRatingLabel,
  
  // Purchase Order helpers
  getPurchaseOrderStatusColor,
  getPurchaseOrderStatusLabel,
  getPurchaseOrderPriorityColor,
  getPurchaseOrderPriorityLabel,
  
  // Communication helpers
  getCommunicationTypeIcon,
  getCommunicationTypeLabel,
  getCommunicationDirectionColor,
  getCommunicationDirectionLabel,
  
  // Payment terms helpers
  getPaymentTermsLabel,
  
  // Validation helpers
  validateSupplierCode,
  validateEmail,
  validatePhone,
  validateWebsite,
  
  // Formatting helpers
  formatSupplierName,
  formatSupplierAddress,
  formatSupplierContact,
  
  // Performance helpers
  calculateOnTimeDeliveryRate,
  calculateDefectRate,
  calculateAverageLeadTime,
  
  // Score helpers
  calculateOverallScore,
  getScoreGrade,
  getScoreColor,
  
  // Date helpers
  isOverdue,
  getDaysUntilDue,
  formatDaysUntilDue,
  
  // Search and filter helpers
  searchSuppliers,
  sortSuppliers,
};