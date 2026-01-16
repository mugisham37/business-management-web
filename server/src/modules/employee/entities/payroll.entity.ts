import { Employee } from './employee.entity';

export class PayrollPeriod {
  id!: string;
  tenantId!: string;
  periodName!: string;
  startDate!: Date;
  endDate!: Date;
  payDate!: Date;
  periodType!: string;
  status!: string;
  totalGrossPay?: number;
  totalNetPay?: number;
  totalTaxes?: number;
  totalDeductions?: number;
  processedAt?: Date;
  processedBy?: string;
  notes?: string;
  createdAt!: Date;
  updatedAt!: Date;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date;
  version!: number;
  isActive!: boolean;

  // Relations
  payrollRecords?: PayrollRecord[];

  // Computed properties
  employeeCount?: number;
  daysInPeriod?: number;
}

export class PayrollRecord {
  id!: string;
  tenantId!: string;
  employeeId!: string;
  payrollPeriodId!: string;

  // Hours worked
  regularHours?: number;
  overtimeHours?: number;
  holidayHours?: number;
  sickHours?: number;
  vacationHours?: number;

  // Pay rates
  regularRate?: number;
  overtimeRate?: number;
  holidayRate?: number;

  // Gross pay calculations
  regularPay?: number;
  overtimePay?: number;
  holidayPay?: number;
  commissionPay?: number;
  bonusPay?: number;
  grossPay?: number;

  // Tax calculations
  federalTax?: number;
  stateTax?: number;
  localTax?: number;
  socialSecurityTax?: number;
  medicareTax?: number;
  unemploymentTax?: number;
  totalTaxes?: number;

  // Deductions
  healthInsurance?: number;
  dentalInsurance?: number;
  visionInsurance?: number;
  retirement401k?: number;
  otherDeductions?: number;
  totalDeductions?: number;

  // Net pay
  netPay?: number;

  // Commission and bonus details
  commissionDetails?: any[];
  bonusDetails?: any[];

  // Tax details
  taxDetails?: Record<string, any>;

  status!: string;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;

  createdAt!: Date;
  updatedAt!: Date;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date;
  version!: number;
  isActive!: boolean;

  // Relations
  employee?: Employee;
  payrollPeriod?: PayrollPeriod;

  // Computed properties
  totalHours?: number;
  effectiveHourlyRate?: number;
  taxRate?: number;
  deductionRate?: number;
}

export class CommissionRecord {
  id!: string;
  tenantId!: string;
  employeeId!: string;
  transactionId?: string;
  saleAmount!: number;
  commissionRate!: number;
  commissionAmount!: number;
  saleDate!: Date;
  payrollPeriodId?: string;
  commissionType?: string;
  productCategory?: string;
  customerType?: string;
  status!: string;
  description?: string;
  notes?: string;

  createdAt!: Date;
  updatedAt!: Date;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date;
  version!: number;
  isActive!: boolean;

  // Relations
  employee?: Employee;
  payrollPeriod?: PayrollPeriod;

  // Computed properties
  isPaid?: boolean;
  daysOld?: number;
}