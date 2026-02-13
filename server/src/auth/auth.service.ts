import {
  Injectable,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import { CacheService } from '../cache/cache.service';
import { UserRole } from '../tenant/tenant-context.interface';
import { RegisterOrganizationDto, AuthResponseDto } from './dto';
import { hashPassword, validatePasswordComplexity } from '../common/utils/password.util';
import { generateAccessToken, generateRefreshToken, TokenPayload } from '../common/utils/token.util';
import { v4 as uuidv4 } from 'uuid';

/**
 * Authentication Service
 * Handles user registration, login, token management, and password operations
 * Implements requirements 1.1-1.10, 3.1-3.8, 4.1-4.7
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizationsService: OrganizationsService,
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register a new organization with an Owner user
   * Uses Prisma transaction for atomicity
   * Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 1.7, 1.8, 1.9, 1.10
   * 
   * @param dto - Registration data including business and owner information
   * @returns AuthResponseDto with tokens and user data
   * @throws BadRequestException if validation fails
   * @throws ConflictException if email already exists in organization
   */
  async registerOrganization(dto: RegisterOrganizationDto): Promise<AuthResponseDto> {
    // Validate acceptedTerms is true (Requirement 1.10)
    if (!dto.acceptedTerms) {
      throw new BadRequestException('You must accept the terms and conditions to register');
    }

    // Validate required fields (Requirement 1.8)
    if (!dto.businessName || dto.businessName.trim() === '') {
      throw new BadRequestException('businessName is required and cannot be empty');
    }
    if (!dto.email || dto.email.trim() === '') {
      throw new BadRequestException('email is required and cannot be empty');
    }
    if (!dto.firstName || dto.firstName.trim() === '') {
      throw new BadRequestException('firstName is required and cannot be empty');
    }
    if (!dto.lastName || dto.lastName.trim() === '') {
      throw new BadRequestException('lastName is required and cannot be empty');
    }

    // Validate password complexity (Requirement 1.3, 14.1)
    const passwordValidation = validatePasswordComplexity(dto.password);
    if (!passwordValidation.isValid) {
      throw new BadRequestException({
        message: 'Password does not meet complexity requirements',
        errors: passwordValidation.errors,
      });
    }

    // Hash password with bcrypt (12 rounds) (Requirement 1.3)
    const passwordHash = await hashPassword(dto.password);

    try {
      // Use Prisma transaction for atomicity (Requirement 1.1, 1.6)
      const result = await this.prisma.$transaction(async (tx) => {
        // Generate UUID for organization_id (Requirement 1.2)
        const organizationId = uuidv4();

        // Create Organization
        const organization = await tx.organization.create({
          data: {
            id: organizationId,
            businessName: dto.businessName,
            businessType: dto.businessType,
            employeeCount: dto.employeeCount,
            industry: dto.industry,
            country: dto.country,
            selectedModules: dto.selectedModules || [],
            primaryGoal: dto.primaryGoal,
            cloudProvider: dto.cloudProvider,
            region: dto.region,
            storageVolume: dto.storageVolume,
            compression: dto.compression ?? false,
            activeHours: dto.activeHours,
            integrations: dto.integrations || [],
            selectedPlan: dto.selectedPlan,
            billingCycle: dto.billingCycle,
          },
        });

        // Create Owner User (Requirement 1.7)
        const user = await tx.user.create({
          data: {
            email: dto.email,
            passwordHash,
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
            role: 'OWNER',
            organizationId: organization.id,
            emailVerified: false, // Will be verified via email link (Requirement 1.4)
            createdById: null, // Owner has no creator
          },
        });

        return { organization, user };
      });

      // Generate JWT tokens (Requirement 3.2, 4.1, 4.2)
      const tokenPayload: TokenPayload = {
        user_id: result.user.id,
        organization_id: result.organization.id,
        role: result.user.role as 'OWNER' | 'MANAGER' | 'WORKER',
      };

      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

      if (!jwtSecret || !jwtRefreshSecret) {
        throw new InternalServerErrorException('JWT secrets not configured');
      }

      const accessToken = generateAccessToken(tokenPayload, jwtSecret);
      const familyId = uuidv4();
      const refreshToken = generateRefreshToken(tokenPayload, familyId, jwtRefreshSecret);

      // Store refresh token in database (Requirement 4.2, 4.8)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      await this.prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: result.user.id,
          familyId,
          expiresAt,
        },
      });

      // Log registration in audit log (Requirement 1.10, 11.2)
      await this.auditService.logUserCreation(
        result.user.id, // Creator is self for Owner
        result.user.id,
        UserRole.OWNER,
        result.organization.id,
      );

      // TODO: Send email verification link (Requirement 1.4)
      // This will be implemented when email service is available
      // await this.emailService.sendVerificationEmail(result.user.email, verificationToken);

      // Return auth response with sanitized user data
      const { passwordHash: _, passwordHistory, mfaSecret, backupCodes, ...sanitizedUser } = result.user;

      return {
        accessToken,
        refreshToken,
        user: sanitizedUser,
        requiresMFA: false, // MFA not enabled on registration
      };
    } catch (error) {
      // Handle unique constraint violations (email already exists)
      if (error.code === 'P2002') {
        throw new ConflictException(
          'A user with this email already exists in this organization',
        );
      }

      // Rollback is automatic with Prisma transactions (Requirement 1.6)
      throw new InternalServerErrorException(
        'Failed to register organization. Please try again.',
      );
    }
  }
}
