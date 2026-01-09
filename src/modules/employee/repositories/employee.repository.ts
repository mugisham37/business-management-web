import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../database/drizzle.service';
import { 
  employees, 
  employeeSchedules, 
  timeEntries, 
  performanceReviews, 
  trainingRecords, 
  employeeGoals 
} from '../../database/schema';
import { 
  CreateEmployeeDto, 
  UpdateEmployeeDto,
  CreateEmployeeScheduleDto,
  UpdateEmployeeScheduleDto,
  CreateTimeEntryDto,
  UpdateTimeEntryDto,
  CreatePerformanceReviewDto,
  UpdatePerformanceReviewDto,
  CreateTrainingRecordDto,
  UpdateTrainingRecordDto,
  CreateEmployeeGoalDto,
  UpdateEmployeeGoalDto,
  EmployeeQueryDto,
  TimeEntryQueryDto
} from '../dto/employee.dto';
import { eq, and, gte, lte, like, desc, asc, isNull, count, sql } from 'drizzle-orm';
import { Employee, EmployeeSchedule, TimeEntry, PerformanceReview, TrainingRecord, EmployeeGoal } from '../entities/employee.entity';

@Injectable()
export class EmployeeRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  // Employee CRUD operations
  async createEmployee(tenantId: string, data: CreateEmployeeDto, createdBy: string): Promise<Employee> {
    const [employee] = await this.drizzle.getDb()
      .insert(employees)
      .values({
        tenantId,
        createdBy,
        updatedBy: createdBy,
        employeeNumber: data.employeeNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        displayName: data.displayName,
        email: data.email,
        phone: data.phone,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        address: data.address,
        department: data.department,
        position: data.position,
        employmentType: data.employmentType || 'full_time',
        employmentStatus: data.employmentStatus || 'active',
        hireDate: data.hireDate,
        terminationDate: data.terminationDate,
        probationEndDate: data.probationEndDate,
        baseSalary: data.baseSalary?.toString(),
        hourlyRate: data.hourlyRate?.toString(),
        payFrequency: data.payFrequency,
        benefits: data.benefits,
        settings: data.settings,
        managerId: data.managerId,
        userId: data.userId,
        notes: data.notes,
        customFields: data.customFields,
      })
      .returning();

    return this.mapEmployeeEntity(employee);
  }

  async findEmployeeById(tenantId: string, id: string): Promise<Employee | null> {
    const [employee] = await this.drizzle.getDb()
      .select()
      .from(employees)
      .where(and(
        eq(employees.tenantId, tenantId),
        eq(employees.id, id),
        isNull(employees.deletedAt)
      ));

    return employee ? this.mapEmployeeEntity(employee) : null;
  }

  async findEmployeeByNumber(tenantId: string, employeeNumber: string): Promise<Employee | null> {
    const [employee] = await this.drizzle.getDb()
      .select()
      .from(employees)
      .where(and(
        eq(employees.tenantId, tenantId),
        eq(employees.employeeNumber, employeeNumber),
        isNull(employees.deletedAt)
      ));

    return employee ? this.mapEmployeeEntity(employee) : null;
  }

  async findEmployees(tenantId: string, query: EmployeeQueryDto): Promise<{ employees: Employee[]; total: number }> {
    const conditions = [
      eq(employees.tenantId, tenantId),
      isNull(employees.deletedAt)
    ];

    // Add search conditions
    if (query.search) {
      conditions.push(
        sql`(${employees.firstName} ILIKE ${`%${query.search}%`} OR 
             ${employees.lastName} ILIKE ${`%${query.search}%`} OR 
             ${employees.employeeNumber} ILIKE ${`%${query.search}%`} OR 
             ${employees.email} ILIKE ${`%${query.search}%`})`
      );
    }

    if (query.department) {
      conditions.push(eq(employees.department, query.department));
    }

    if (query.position) {
      conditions.push(like(employees.position, `%${query.position}%`));
    }

    if (query.employmentStatus) {
      conditions.push(eq(employees.employmentStatus, query.employmentStatus));
    }

    if (query.employmentType) {
      conditions.push(eq(employees.employmentType, query.employmentType));
    }

    if (query.managerId) {
      conditions.push(eq(employees.managerId, query.managerId));
    }

    const whereClause = and(...conditions);

    // Get total count
    const [{ count: totalCount }] = await this.drizzle.db
      .select({ count: count() })
      .from(employees)
      .where(whereClause);

    // Get paginated results
    const offset = (query.page - 1) * query.limit;
    const orderBy = query.sortOrder === 'desc' 
      ? desc(employees[query.sortBy as keyof typeof employees] || employees.lastName)
      : asc(employees[query.sortBy as keyof typeof employees] || employees.lastName);

    const results = await this.drizzle.db
      .select()
      .from(employees)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(query.limit)
      .offset(offset);

    return {
      employees: results.map(emp => this.mapEmployeeEntity(emp)),
      total: totalCount
    };
  }

  async updateEmployee(tenantId: string, id: string, data: UpdateEmployeeDto, updatedBy: string): Promise<Employee> {
    const [employee] = await this.drizzle.db
      .update(employees)
      .set({
        ...data,
        updatedBy,
        updatedAt: new Date(),
        version: sql`${employees.version} + 1`
      })
      .where(and(
        eq(employees.tenantId, tenantId),
        eq(employees.id, id),
        isNull(employees.deletedAt)
      ))
      .returning();

    return this.mapEmployeeEntity(employee);
  }

  async deleteEmployee(tenantId: string, id: string, deletedBy: string): Promise<void> {
    await this.drizzle.db
      .update(employees)
      .set({
        deletedAt: new Date(),
        updatedBy: deletedBy,
        updatedAt: new Date(),
        version: sql`${employees.version} + 1`
      })
      .where(and(
        eq(employees.tenantId, tenantId),
        eq(employees.id, id)
      ));
  }

  // Employee Schedule operations
  async createSchedule(tenantId: string, data: CreateEmployeeScheduleDto, createdBy: string): Promise<EmployeeSchedule> {
    const [schedule] = await this.drizzle.db
      .insert(employeeSchedules)
      .values({
        ...data,
        tenantId,
        createdBy,
        updatedBy: createdBy,
      })
      .returning();

    return this.mapScheduleEntity(schedule);
  }

  async findSchedulesByEmployee(tenantId: string, employeeId: string, startDate?: Date, endDate?: Date): Promise<EmployeeSchedule[]> {
    const conditions = [
      eq(employeeSchedules.tenantId, tenantId),
      eq(employeeSchedules.employeeId, employeeId),
      isNull(employeeSchedules.deletedAt)
    ];

    if (startDate) {
      conditions.push(gte(employeeSchedules.scheduleDate, startDate));
    }

    if (endDate) {
      conditions.push(lte(employeeSchedules.scheduleDate, endDate));
    }

    const results = await this.drizzle.db
      .select()
      .from(employeeSchedules)
      .where(and(...conditions))
      .orderBy(asc(employeeSchedules.scheduleDate));

    return results.map(schedule => this.mapScheduleEntity(schedule));
  }

  async updateSchedule(tenantId: string, id: string, data: UpdateEmployeeScheduleDto, updatedBy: string): Promise<EmployeeSchedule> {
    const [schedule] = await this.drizzle.db
      .update(employeeSchedules)
      .set({
        ...data,
        updatedBy,
        updatedAt: new Date(),
        version: sql`${employeeSchedules.version} + 1`
      })
      .where(and(
        eq(employeeSchedules.tenantId, tenantId),
        eq(employeeSchedules.id, id),
        isNull(employeeSchedules.deletedAt)
      ))
      .returning();

    return this.mapScheduleEntity(schedule);
  }

  // Time Entry operations
  async createTimeEntry(tenantId: string, data: CreateTimeEntryDto, createdBy: string): Promise<TimeEntry> {
    const [timeEntry] = await this.drizzle.db
      .insert(timeEntries)
      .values({
        ...data,
        tenantId,
        createdBy,
        updatedBy: createdBy,
      })
      .returning();

    return this.mapTimeEntryEntity(timeEntry);
  }

  async findActiveTimeEntry(tenantId: string, employeeId: string): Promise<TimeEntry | null> {
    const [timeEntry] = await this.drizzle.db
      .select()
      .from(timeEntries)
      .where(and(
        eq(timeEntries.tenantId, tenantId),
        eq(timeEntries.employeeId, employeeId),
        isNull(timeEntries.clockOutTime),
        isNull(timeEntries.deletedAt)
      ))
      .orderBy(desc(timeEntries.clockInTime))
      .limit(1);

    return timeEntry ? this.mapTimeEntryEntity(timeEntry) : null;
  }

  async findTimeEntries(tenantId: string, query: TimeEntryQueryDto): Promise<{ timeEntries: TimeEntry[]; total: number }> {
    const conditions = [
      eq(timeEntries.tenantId, tenantId),
      isNull(timeEntries.deletedAt)
    ];

    if (query.employeeId) {
      conditions.push(eq(timeEntries.employeeId, query.employeeId));
    }

    if (query.startDate) {
      conditions.push(gte(timeEntries.clockInTime, new Date(query.startDate)));
    }

    if (query.endDate) {
      conditions.push(lte(timeEntries.clockInTime, new Date(query.endDate)));
    }

    if (query.entryType) {
      conditions.push(eq(timeEntries.entryType, query.entryType));
    }

    if (query.isApproved !== undefined) {
      conditions.push(eq(timeEntries.isApproved, query.isApproved));
    }

    const whereClause = and(...conditions);

    // Get total count
    const [{ count: totalCount }] = await this.drizzle.db
      .select({ count: count() })
      .from(timeEntries)
      .where(whereClause);

    // Get paginated results
    const offset = (query.page - 1) * query.limit;

    const results = await this.drizzle.db
      .select()
      .from(timeEntries)
      .where(whereClause)
      .orderBy(desc(timeEntries.clockInTime))
      .limit(query.limit)
      .offset(offset);

    return {
      timeEntries: results.map(entry => this.mapTimeEntryEntity(entry)),
      total: totalCount
    };
  }

  async updateTimeEntry(tenantId: string, id: string, data: UpdateTimeEntryDto, updatedBy: string): Promise<TimeEntry> {
    const updateData: any = {
      ...data,
      updatedBy,
      updatedAt: new Date(),
      version: sql`${timeEntries.version} + 1`
    };

    // Calculate hours if clock out time is provided
    if (data.clockOutTime) {
      // This would be calculated in the service layer
      // updateData.totalHours = calculateHours(clockInTime, clockOutTime);
    }

    const [timeEntry] = await this.drizzle.db
      .update(timeEntries)
      .set(updateData)
      .where(and(
        eq(timeEntries.tenantId, tenantId),
        eq(timeEntries.id, id),
        isNull(timeEntries.deletedAt)
      ))
      .returning();

    return this.mapTimeEntryEntity(timeEntry);
  }

  // Performance Review operations
  async createPerformanceReview(tenantId: string, data: CreatePerformanceReviewDto, createdBy: string): Promise<PerformanceReview> {
    const [review] = await this.drizzle.db
      .insert(performanceReviews)
      .values({
        ...data,
        tenantId,
        createdBy,
        updatedBy: createdBy,
      })
      .returning();

    return this.mapPerformanceReviewEntity(review);
  }

  async findPerformanceReviewsByEmployee(tenantId: string, employeeId: string): Promise<PerformanceReview[]> {
    const results = await this.drizzle.db
      .select()
      .from(performanceReviews)
      .where(and(
        eq(performanceReviews.tenantId, tenantId),
        eq(performanceReviews.employeeId, employeeId),
        isNull(performanceReviews.deletedAt)
      ))
      .orderBy(desc(performanceReviews.reviewPeriodEnd));

    return results.map(review => this.mapPerformanceReviewEntity(review));
  }

  // Training Record operations
  async createTrainingRecord(tenantId: string, data: CreateTrainingRecordDto, createdBy: string): Promise<TrainingRecord> {
    const [training] = await this.drizzle.db
      .insert(trainingRecords)
      .values({
        ...data,
        tenantId,
        createdBy,
        updatedBy: createdBy,
      })
      .returning();

    return this.mapTrainingRecordEntity(training);
  }

  async findTrainingRecordsByEmployee(tenantId: string, employeeId: string): Promise<TrainingRecord[]> {
    const results = await this.drizzle.db
      .select()
      .from(trainingRecords)
      .where(and(
        eq(trainingRecords.tenantId, tenantId),
        eq(trainingRecords.employeeId, employeeId),
        isNull(trainingRecords.deletedAt)
      ))
      .orderBy(desc(trainingRecords.startDate));

    return results.map(training => this.mapTrainingRecordEntity(training));
  }

  // Employee Goal operations
  async createEmployeeGoal(tenantId: string, data: CreateEmployeeGoalDto, createdBy: string): Promise<EmployeeGoal> {
    const [goal] = await this.drizzle.db
      .insert(employeeGoals)
      .values({
        ...data,
        tenantId,
        createdBy,
        updatedBy: createdBy,
      })
      .returning();

    return this.mapEmployeeGoalEntity(goal);
  }

  async findGoalsByEmployee(tenantId: string, employeeId: string): Promise<EmployeeGoal[]> {
    const results = await this.drizzle.db
      .select()
      .from(employeeGoals)
      .where(and(
        eq(employeeGoals.tenantId, tenantId),
        eq(employeeGoals.employeeId, employeeId),
        isNull(employeeGoals.deletedAt)
      ))
      .orderBy(desc(employeeGoals.targetDate));

    return results.map(goal => this.mapEmployeeGoalEntity(goal));
  }

  async findGoalById(tenantId: string, id: string): Promise<EmployeeGoal | null> {
    const [goal] = await this.drizzle.db
      .select()
      .from(employeeGoals)
      .where(and(
        eq(employeeGoals.tenantId, tenantId),
        eq(employeeGoals.id, id),
        isNull(employeeGoals.deletedAt)
      ));

    return goal ? this.mapEmployeeGoalEntity(goal) : null;
  }

  async updatePerformanceReview(tenantId: string, id: string, data: UpdatePerformanceReviewDto, updatedBy: string): Promise<PerformanceReview> {
    const [review] = await this.drizzle.db
      .update(performanceReviews)
      .set({
        ...data,
        updatedBy,
        updatedAt: new Date(),
        version: sql`${performanceReviews.version} + 1`
      })
      .where(and(
        eq(performanceReviews.tenantId, tenantId),
        eq(performanceReviews.id, id),
        isNull(performanceReviews.deletedAt)
      ))
      .returning();

    return this.mapPerformanceReviewEntity(review);
  }

  async updateEmployeeGoal(tenantId: string, id: string, data: UpdateEmployeeGoalDto, updatedBy: string): Promise<EmployeeGoal> {
    const [goal] = await this.drizzle.db
      .update(employeeGoals)
      .set({
        ...data,
        updatedBy,
        updatedAt: new Date(),
        version: sql`${employeeGoals.version} + 1`
      })
      .where(and(
        eq(employeeGoals.tenantId, tenantId),
        eq(employeeGoals.id, id),
        isNull(employeeGoals.deletedAt)
      ))
      .returning();

    return this.mapEmployeeGoalEntity(goal);
  }

  async updateTrainingRecord(tenantId: string, id: string, data: UpdateTrainingRecordDto, updatedBy: string): Promise<TrainingRecord> {
    const [training] = await this.drizzle.db
      .update(trainingRecords)
      .set({
        ...data,
        updatedBy,
        updatedAt: new Date(),
        version: sql`${trainingRecords.version} + 1`
      })
      .where(and(
        eq(trainingRecords.tenantId, tenantId),
        eq(trainingRecords.id, id),
        isNull(trainingRecords.deletedAt)
      ))
      .returning();

    return this.mapTrainingRecordEntity(training);
  }

  // Helper methods to map database records to entities
  private mapEmployeeEntity(record: any): Employee {
    return {
      id: record.id,
      tenantId: record.tenantId,
      userId: record.userId,
      employeeNumber: record.employeeNumber,
      firstName: record.firstName,
      lastName: record.lastName,
      middleName: record.middleName,
      displayName: record.displayName || `${record.firstName} ${record.lastName}`,
      email: record.email,
      phone: record.phone,
      emergencyContactName: record.emergencyContactName,
      emergencyContactPhone: record.emergencyContactPhone,
      address: record.address,
      department: record.department,
      position: record.position,
      employmentType: record.employmentType,
      employmentStatus: record.employmentStatus,
      hireDate: record.hireDate,
      terminationDate: record.terminationDate,
      probationEndDate: record.probationEndDate,
      baseSalary: record.baseSalary ? parseFloat(record.baseSalary) : undefined,
      hourlyRate: record.hourlyRate ? parseFloat(record.hourlyRate) : undefined,
      payFrequency: record.payFrequency,
      benefits: record.benefits,
      settings: record.settings,
      managerId: record.managerId,
      avatar: record.avatar,
      documents: record.documents,
      notes: record.notes,
      customFields: record.customFields,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      createdBy: record.createdBy,
      updatedBy: record.updatedBy,
      deletedAt: record.deletedAt,
      version: record.version,
      isActive: record.isActive,
      fullName: `${record.firstName} ${record.lastName}`,
    };
  }

  private mapScheduleEntity(record: any): EmployeeSchedule {
    return {
      id: record.id,
      tenantId: record.tenantId,
      employeeId: record.employeeId,
      scheduleDate: record.scheduleDate,
      startTime: record.startTime,
      endTime: record.endTime,
      breakDuration: record.breakDuration,
      lunchBreakStart: record.lunchBreakStart,
      lunchBreakEnd: record.lunchBreakEnd,
      scheduleType: record.scheduleType,
      status: record.status,
      locationId: record.locationId,
      department: record.department,
      notes: record.notes,
      approvedBy: record.approvedBy,
      approvedAt: record.approvedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      createdBy: record.createdBy,
      updatedBy: record.updatedBy,
      version: record.version,
      isActive: record.isActive,
    };
  }

  private mapTimeEntryEntity(record: any): TimeEntry {
    return {
      id: record.id,
      tenantId: record.tenantId,
      employeeId: record.employeeId,
      clockInTime: record.clockInTime,
      clockOutTime: record.clockOutTime,
      totalHours: record.totalHours ? parseFloat(record.totalHours) : undefined,
      regularHours: record.regularHours ? parseFloat(record.regularHours) : undefined,
      overtimeHours: record.overtimeHours ? parseFloat(record.overtimeHours) : undefined,
      breakStartTime: record.breakStartTime,
      breakEndTime: record.breakEndTime,
      totalBreakTime: record.totalBreakTime,
      entryType: record.entryType,
      locationId: record.locationId,
      department: record.department,
      clockInLocation: record.clockInLocation,
      clockOutLocation: record.clockOutLocation,
      isApproved: record.isApproved,
      approvedBy: record.approvedBy,
      approvedAt: record.approvedAt,
      adjustmentReason: record.adjustmentReason,
      adjustedBy: record.adjustedBy,
      adjustedAt: record.adjustedAt,
      notes: record.notes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      createdBy: record.createdBy,
      updatedBy: record.updatedBy,
      version: record.version,
      isActive: record.isActive,
      isCurrentlyWorking: !record.clockOutTime,
    };
  }

  private mapPerformanceReviewEntity(record: any): PerformanceReview {
    return {
      id: record.id,
      tenantId: record.tenantId,
      employeeId: record.employeeId,
      reviewerId: record.reviewerId,
      reviewPeriodStart: record.reviewPeriodStart,
      reviewPeriodEnd: record.reviewPeriodEnd,
      reviewType: record.reviewType,
      overallRating: record.overallRating,
      goals: record.goals,
      achievements: record.achievements,
      areasForImprovement: record.areasForImprovement,
      ratings: record.ratings,
      reviewerComments: record.reviewerComments,
      employeeComments: record.employeeComments,
      status: record.status,
      completedAt: record.completedAt,
      acknowledgedAt: record.acknowledgedAt,
      nextReviewDate: record.nextReviewDate,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      createdBy: record.createdBy,
      updatedBy: record.updatedBy,
      version: record.version,
      isActive: record.isActive,
    };
  }

  private mapTrainingRecordEntity(record: any): TrainingRecord {
    return {
      id: record.id,
      tenantId: record.tenantId,
      employeeId: record.employeeId,
      trainingName: record.trainingName,
      trainingType: record.trainingType,
      provider: record.provider,
      startDate: record.startDate,
      completionDate: record.completionDate,
      expirationDate: record.expirationDate,
      duration: record.duration,
      certificateNumber: record.certificateNumber,
      certificationBody: record.certificationBody,
      status: record.status,
      score: record.score ? parseFloat(record.score) : undefined,
      passingScore: record.passingScore ? parseFloat(record.passingScore) : undefined,
      cost: record.cost ? parseFloat(record.cost) : undefined,
      approvedBy: record.approvedBy,
      documents: record.documents,
      notes: record.notes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      createdBy: record.createdBy,
      updatedBy: record.updatedBy,
      version: record.version,
      isActive: record.isActive,
      isExpired: record.expirationDate ? new Date(record.expirationDate) < new Date() : false,
    };
  }

  private mapEmployeeGoalEntity(record: any): EmployeeGoal {
    return {
      id: record.id,
      tenantId: record.tenantId,
      employeeId: record.employeeId,
      title: record.title,
      description: record.description,
      category: record.category,
      startDate: record.startDate,
      targetDate: record.targetDate,
      completedDate: record.completedDate,
      status: record.status,
      progress: record.progress,
      metrics: record.metrics,
      targetValue: record.targetValue ? parseFloat(record.targetValue) : undefined,
      currentValue: record.currentValue ? parseFloat(record.currentValue) : undefined,
      approvedBy: record.approvedBy,
      reviewedBy: record.reviewedBy,
      lastReviewDate: record.lastReviewDate,
      notes: record.notes,
      updates: record.updates,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      createdBy: record.createdBy,
      updatedBy: record.updatedBy,
      version: record.version,
      isActive: record.isActive,
      isOverdue: record.targetDate ? new Date(record.targetDate) < new Date() && record.status !== 'completed' : false,
    };
  }
}