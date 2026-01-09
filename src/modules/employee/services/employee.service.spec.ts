import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmployeeService } from './employee.service';
import { EmployeeRepository } from '../repositories/employee.repository';
import { CreateEmployeeDto, CreateEmployeeScheduleDto, ClockInDto, ClockOutDto } from '../dto/employee.dto';
import { Employee, EmployeeSchedule, TimeEntry } from '../entities/employee.entity';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let repository: jest.Mocked<EmployeeRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockTenantId = 'tenant-123';
  const mockUserId = 'user-123';
  const mockEmployeeId = 'employee-123';

  const mockEmployee: Employee = {
    id: mockEmployeeId,
    tenantId: mockTenantId,
    employeeNumber: 'EMP001',
    firstName: 'John',
    lastName: 'Doe',
    position: 'Software Developer',
    employmentType: 'full_time',
    employmentStatus: 'active',
    hireDate: new Date('2023-01-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    isActive: true,
    fullName: 'John Doe',
  };

  beforeEach(async () => {
    const mockRepository = {
      createEmployee: jest.fn(),
      findEmployeeById: jest.fn(),
      findEmployeeByNumber: jest.fn(),
      findEmployees: jest.fn(),
      updateEmployee: jest.fn(),
      deleteEmployee: jest.fn(),
      createSchedule: jest.fn(),
      findSchedulesByEmployee: jest.fn(),
      updateSchedule: jest.fn(),
      createTimeEntry: jest.fn(),
      findActiveTimeEntry: jest.fn(),
      updateTimeEntry: jest.fn(),
      findTimeEntries: jest.fn(),
      createPerformanceReview: jest.fn(),
      findPerformanceReviewsByEmployee: jest.fn(),
      createTrainingRecord: jest.fn(),
      findTrainingRecordsByEmployee: jest.fn(),
      createEmployeeGoal: jest.fn(),
      findGoalsByEmployee: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        {
          provide: EmployeeRepository,
          useValue: mockRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
    repository = module.get(EmployeeRepository);
    eventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createEmployee', () => {
    const createEmployeeDto: CreateEmployeeDto = {
      employeeNumber: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      position: 'Software Developer',
      hireDate: '2023-01-01',
    };

    it('should create an employee successfully', async () => {
      repository.findEmployeeByNumber.mockResolvedValue(null);
      repository.createEmployee.mockResolvedValue(mockEmployee);

      const result = await service.createEmployee(mockTenantId, createEmployeeDto, mockUserId);

      expect(repository.findEmployeeByNumber).toHaveBeenCalledWith(mockTenantId, createEmployeeDto.employeeNumber);
      expect(repository.createEmployee).toHaveBeenCalledWith(mockTenantId, createEmployeeDto, mockUserId);
      expect(eventEmitter.emit).toHaveBeenCalledWith('employee.created', expect.any(Object));
      expect(result).toEqual(mockEmployee);
    });

    it('should throw ConflictException if employee number already exists', async () => {
      repository.findEmployeeByNumber.mockResolvedValue(mockEmployee);

      await expect(
        service.createEmployee(mockTenantId, createEmployeeDto, mockUserId)
      ).rejects.toThrow(ConflictException);

      expect(repository.createEmployee).not.toHaveBeenCalled();
    });
  });

  describe('findEmployeeById', () => {
    it('should return employee if found', async () => {
      repository.findEmployeeById.mockResolvedValue(mockEmployee);

      const result = await service.findEmployeeById(mockTenantId, mockEmployeeId);

      expect(repository.findEmployeeById).toHaveBeenCalledWith(mockTenantId, mockEmployeeId);
      expect(result).toEqual(mockEmployee);
    });

    it('should throw NotFoundException if employee not found', async () => {
      repository.findEmployeeById.mockResolvedValue(null);

      await expect(
        service.findEmployeeById(mockTenantId, mockEmployeeId)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateEmployee', () => {
    const updateEmployeeDto = {
      firstName: 'Jane',
      lastName: 'Smith',
    };

    it('should update employee successfully', async () => {
      const updatedEmployee = { ...mockEmployee, ...updateEmployeeDto };
      
      repository.findEmployeeById.mockResolvedValue(mockEmployee);
      repository.updateEmployee.mockResolvedValue(updatedEmployee);

      const result = await service.updateEmployee(mockTenantId, mockEmployeeId, updateEmployeeDto, mockUserId);

      expect(repository.findEmployeeById).toHaveBeenCalledWith(mockTenantId, mockEmployeeId);
      expect(repository.updateEmployee).toHaveBeenCalledWith(mockTenantId, mockEmployeeId, updateEmployeeDto, mockUserId);
      expect(eventEmitter.emit).toHaveBeenCalledWith('employee.updated', expect.any(Object));
      expect(result).toEqual(updatedEmployee);
    });

    it('should throw NotFoundException if employee not found', async () => {
      repository.findEmployeeById.mockResolvedValue(null);

      await expect(
        service.updateEmployee(mockTenantId, mockEmployeeId, updateEmployeeDto, mockUserId)
      ).rejects.toThrow(NotFoundException);

      expect(repository.updateEmployee).not.toHaveBeenCalled();
    });
  });

  describe('createSchedule', () => {
    const createScheduleDto: CreateEmployeeScheduleDto = {
      employeeId: mockEmployeeId,
      scheduleDate: '2023-12-01',
      startTime: '2023-12-01T09:00:00Z',
      endTime: '2023-12-01T17:00:00Z',
    };

    const mockSchedule: EmployeeSchedule = {
      id: 'schedule-123',
      tenantId: mockTenantId,
      employeeId: mockEmployeeId,
      scheduleDate: new Date('2023-12-01'),
      startTime: new Date('2023-12-01T09:00:00Z'),
      endTime: new Date('2023-12-01T17:00:00Z'),
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      isActive: true,
    };

    it('should create schedule successfully', async () => {
      repository.findEmployeeById.mockResolvedValue(mockEmployee);
      repository.findSchedulesByEmployee.mockResolvedValue([]);
      repository.createSchedule.mockResolvedValue(mockSchedule);

      const result = await service.createSchedule(mockTenantId, createScheduleDto, mockUserId);

      expect(repository.findEmployeeById).toHaveBeenCalledWith(mockTenantId, mockEmployeeId);
      expect(repository.findSchedulesByEmployee).toHaveBeenCalled();
      expect(repository.createSchedule).toHaveBeenCalledWith(mockTenantId, createScheduleDto, mockUserId);
      expect(eventEmitter.emit).toHaveBeenCalledWith('employee.schedule.created', expect.any(Object));
      expect(result).toEqual(mockSchedule);
    });

    it('should throw BadRequestException if start time is after end time', async () => {
      const invalidScheduleDto = {
        ...createScheduleDto,
        startTime: '2023-12-01T17:00:00Z',
        endTime: '2023-12-01T09:00:00Z',
      };

      repository.findEmployeeById.mockResolvedValue(mockEmployee);

      await expect(
        service.createSchedule(mockTenantId, invalidScheduleDto, mockUserId)
      ).rejects.toThrow(BadRequestException);

      expect(repository.createSchedule).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if schedule conflicts with existing schedule', async () => {
      const conflictingSchedule: EmployeeSchedule = {
        ...mockSchedule,
        startTime: new Date('2023-12-01T08:00:00Z'),
        endTime: new Date('2023-12-01T16:00:00Z'),
      };

      repository.findEmployeeById.mockResolvedValue(mockEmployee);
      repository.findSchedulesByEmployee.mockResolvedValue([conflictingSchedule]);

      await expect(
        service.createSchedule(mockTenantId, createScheduleDto, mockUserId)
      ).rejects.toThrow(ConflictException);

      expect(repository.createSchedule).not.toHaveBeenCalled();
    });
  });

  describe('clockIn', () => {
    const clockInDto: ClockInDto = {
      employeeId: mockEmployeeId,
      locationId: 'location-123',
    };

    const mockTimeEntry: TimeEntry = {
      id: 'time-entry-123',
      tenantId: mockTenantId,
      employeeId: mockEmployeeId,
      clockInTime: new Date(),
      entryType: 'regular',
      isApproved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      isActive: true,
      isCurrentlyWorking: true,
    };

    it('should clock in employee successfully', async () => {
      repository.findEmployeeById.mockResolvedValue(mockEmployee);
      repository.findActiveTimeEntry.mockResolvedValue(null);
      repository.createTimeEntry.mockResolvedValue(mockTimeEntry);

      const result = await service.clockIn(mockTenantId, clockInDto, mockUserId);

      expect(repository.findEmployeeById).toHaveBeenCalledWith(mockTenantId, mockEmployeeId);
      expect(repository.findActiveTimeEntry).toHaveBeenCalledWith(mockTenantId, mockEmployeeId);
      expect(repository.createTimeEntry).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('employee.clocked.in', expect.any(Object));
      expect(result).toEqual(mockTimeEntry);
    });

    it('should throw ConflictException if employee is already clocked in', async () => {
      repository.findEmployeeById.mockResolvedValue(mockEmployee);
      repository.findActiveTimeEntry.mockResolvedValue(mockTimeEntry);

      await expect(
        service.clockIn(mockTenantId, clockInDto, mockUserId)
      ).rejects.toThrow(ConflictException);

      expect(repository.createTimeEntry).not.toHaveBeenCalled();
    });
  });

  describe('clockOut', () => {
    const clockOutDto: ClockOutDto = {
      timeEntryId: 'time-entry-123',
    };

    const mockActiveTimeEntry: TimeEntry = {
      id: 'time-entry-123',
      tenantId: mockTenantId,
      employeeId: mockEmployeeId,
      clockInTime: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      entryType: 'regular',
      isApproved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      isActive: true,
      isCurrentlyWorking: true,
    };

    const mockUpdatedTimeEntry: TimeEntry = {
      ...mockActiveTimeEntry,
      clockOutTime: new Date(),
      totalHours: 8,
      regularHours: 8,
      overtimeHours: 0,
      isCurrentlyWorking: false,
    };

    it('should clock out employee successfully', async () => {
      repository.findActiveTimeEntry.mockResolvedValue(mockActiveTimeEntry);
      repository.updateTimeEntry.mockResolvedValue(mockUpdatedTimeEntry);

      const result = await service.clockOut(mockTenantId, clockOutDto, mockUserId);

      expect(repository.findActiveTimeEntry).toHaveBeenCalledWith(mockTenantId, clockOutDto.timeEntryId);
      expect(repository.updateTimeEntry).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('employee.clocked.out', expect.any(Object));
      expect(result).toEqual(mockUpdatedTimeEntry);
    });

    it('should throw NotFoundException if active time entry not found', async () => {
      repository.findActiveTimeEntry.mockResolvedValue(null);

      await expect(
        service.clockOut(mockTenantId, clockOutDto, mockUserId)
      ).rejects.toThrow(NotFoundException);

      expect(repository.updateTimeEntry).not.toHaveBeenCalled();
    });
  });

  describe('calculateHours', () => {
    it('should calculate hours correctly', () => {
      const startTime = new Date('2023-12-01T09:00:00Z');
      const endTime = new Date('2023-12-01T17:00:00Z');

      // Access private method for testing
      const hours = (service as any).calculateHours(startTime, endTime);

      expect(hours).toBe(8);
    });
  });

  describe('calculateRegularAndOvertimeHours', () => {
    it('should calculate regular hours only for 8 hours or less', () => {
      const result = (service as any).calculateRegularAndOvertimeHours(8);

      expect(result.regularHours).toBe(8);
      expect(result.overtimeHours).toBe(0);
    });

    it('should calculate regular and overtime hours for more than 8 hours', () => {
      const result = (service as any).calculateRegularAndOvertimeHours(10);

      expect(result.regularHours).toBe(8);
      expect(result.overtimeHours).toBe(2);
    });
  });
});