import { Injectable, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SecurityService } from '../../common/security/security.service';
import { Session } from '@prisma/client';

export interface SessionMetadata {
  ipAddress: string;
  userAgent: string;
  deviceFingerprint?: string;
  location?: string;
}

/**
 * Sessions Service for session lifecycle management
 * 
 * Features:
 * - Session creation with device tracking
 * - Session validation and refresh token management
 * - Session revocation (single, all except current, all)
 * - Token rotation for security
 * - Expired session cleanup
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.6, 11.7, 22.5
 */
@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  // Token expiration times
  private readonly REFRESH_TOKEN_EXPIRY_DAYS = 7;

  constructor(
    private readonly prisma: PrismaService,
    private readonly security: SecurityService,
  ) {}

  /**
   * Create a new session
   * 
   * Requirement 11.1: WHEN a user authenticates, THE Session_Manager SHALL create 
   * a session record with device fingerprint and IP address
   * 
   * Requirement 11.2: WHEN a user has multiple active sessions, THE Session_Manager 
   * SHALL track each session independently
   * 
   * @param userId - User ID
   * @param refreshToken - Refresh token (plain text)
   * @param metadata - Session metadata (IP, user agent, device fingerprint, location)
   * @returns Created session
   */
  async create(
    userId: string,
    refreshToken: string,
    metadata: SessionMetadata,
  ): Promise<Session> {
    try {
      // Hash the refresh token for storage
      const refreshTokenHash = await this.security.hashPassword(refreshToken);

      // Calculate expiration time (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_EXPIRY_DAYS);

      // Create session record
      const session = await this.prisma.session.create({
        data: {
          userId,
          refreshToken, // Store plain token for lookup (unique index)
          refreshTokenHash, // Store hash for verification
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
          deviceFingerprint: metadata.deviceFingerprint,
          location: metadata.location,
          expiresAt,
          lastActivityAt: new Date(),
        },
      });

      this.logger.log(`Session created: ${session.id} for user ${userId}`);

      return session;
    } catch (error) {
      this.logger.error(`Failed to create session for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Find session by ID
   * 
   * @param id - Session ID
   * @returns Session or null
   */
  async findById(id: string): Promise<Session | null> {
    try {
      return await this.prisma.session.findUnique({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Failed to find session by ID: ${id}`, error);
      throw error;
    }
  }

  /**
   * Find session by refresh token
   * 
   * @param token - Refresh token (plain text)
   * @returns Session or null
   */
  async findByRefreshToken(token: string): Promise<Session | null> {
    try {
      return await this.prisma.session.findUnique({
        where: { refreshToken: token },
      });
    } catch (error) {
      this.logger.error('Failed to find session by refresh token', error);
      throw error;
    }
  }

  /**
   * Find all sessions for a user
   * 
   * Requirement 11.2: WHEN a user has multiple active sessions, THE Session_Manager 
   * SHALL track each session independently
   * 
   * @param userId - User ID
   * @returns Array of sessions
   */
  async findUserSessions(userId: string): Promise<Session[]> {
    try {
      return await this.prisma.session.findMany({
        where: {
          userId,
          isRevoked: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      this.logger.error(`Failed to find sessions for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Check if a session is valid
   * 
   * Requirement 11.7: WHEN a session expires, THE Session_Manager SHALL require re-authentication
   * 
   * Requirement 22.5: WHEN a refresh token is used, THE Auth_System SHALL validate 
   * it has not been revoked
   * 
   * @param sessionId - Session ID
   * @returns True if session is valid (not expired, not revoked)
   */
  async isValid(sessionId: string): Promise<boolean> {
    try {
      const session = await this.findById(sessionId);
      
      if (!session) {
        return false;
      }

      // Check if session is revoked
      if (session.isRevoked) {
        this.logger.debug(`Session ${sessionId} is revoked`);
        return false;
      }

      // Check if session is expired
      const now = new Date();
      if (session.expiresAt < now) {
        this.logger.debug(`Session ${sessionId} is expired`);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to validate session ${sessionId}:`, error);
      return false;
    }
  }

  /**
   * Validate a refresh token and return the session
   * 
   * Requirement 22.5: WHEN a refresh token is used, THE Auth_System SHALL validate 
   * it has not been revoked
   * 
   * @param token - Refresh token (plain text)
   * @returns Session if valid
   * @throws UnauthorizedException if token is invalid, expired, or revoked
   */
  async validateRefreshToken(token: string): Promise<Session> {
    try {
      // Find session by refresh token
      const session = await this.findByRefreshToken(token);

      if (!session) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if session is revoked
      if (session.isRevoked) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }

      // Check if session is expired
      const now = new Date();
      if (session.expiresAt < now) {
        throw new UnauthorizedException('Refresh token has expired');
      }

      // Verify token hash matches
      const isValid = await this.security.verifyPassword(token, session.refreshTokenHash);
      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Update last activity time
      await this.prisma.session.update({
        where: { id: session.id },
        data: { lastActivityAt: new Date() },
      });

      return session;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Failed to validate refresh token:', error);
      throw new UnauthorizedException('Failed to validate refresh token');
    }
  }

  /**
   * Revoke a session
   * 
   * Requirement 11.3: WHEN a user requests session revocation, THE Session_Manager 
   * SHALL invalidate the specified session within 1 second
   * 
   * @param sessionId - Session ID to revoke
   * @param reason - Optional reason for revocation
   */
  async revoke(sessionId: string, reason?: string): Promise<void> {
    try {
      const session = await this.findById(sessionId);

      if (!session) {
        throw new NotFoundException(`Session not found: ${sessionId}`);
      }

      if (session.isRevoked) {
        this.logger.debug(`Session ${sessionId} is already revoked`);
        return;
      }

      await this.prisma.session.update({
        where: { id: sessionId },
        data: {
          isRevoked: true,
          revokedAt: new Date(),
          revokedReason: reason || 'User logout',
        },
      });

      this.logger.log(`Session revoked: ${sessionId}${reason ? ` - Reason: ${reason}` : ''}`);
    } catch (error) {
      this.logger.error(`Failed to revoke session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Revoke all sessions for a user except the current one
   * 
   * Requirement 11.4: WHEN a user requests "logout all devices", THE Session_Manager 
   * SHALL invalidate all sessions except the current one
   * 
   * @param userId - User ID
   * @param currentSessionId - Current session ID to keep active
   */
  async revokeAllExcept(userId: string, currentSessionId: string): Promise<void> {
    try {
      const result = await this.prisma.session.updateMany({
        where: {
          userId,
          id: { not: currentSessionId },
          isRevoked: false,
        },
        data: {
          isRevoked: true,
          revokedAt: new Date(),
          revokedReason: 'Logout all devices',
        },
      });

      this.logger.log(`Revoked ${result.count} sessions for user ${userId} (except ${currentSessionId})`);
    } catch (error) {
      this.logger.error(`Failed to revoke sessions for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Revoke all sessions for a user
   * 
   * @param userId - User ID
   */
  async revokeAll(userId: string): Promise<void> {
    try {
      const result = await this.prisma.session.updateMany({
        where: {
          userId,
          isRevoked: false,
        },
        data: {
          isRevoked: true,
          revokedAt: new Date(),
          revokedReason: 'All sessions revoked',
        },
      });

      this.logger.log(`Revoked all ${result.count} sessions for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to revoke all sessions for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Rotate refresh token for a session
   * 
   * Requirement 11.6: WHEN a refresh token is used, THE Session_Manager SHALL 
   * rotate the refresh token and invalidate the old one
   * 
   * @param oldToken - Old refresh token (plain text)
   * @returns New refresh token and updated session
   */
  async rotateRefreshToken(oldToken: string): Promise<{ newToken: string; session: Session }> {
    try {
      // Validate the old token first
      const session = await this.validateRefreshToken(oldToken);

      // Generate new refresh token
      const newToken = this.security.generateSecureToken();
      const newTokenHash = await this.security.hashPassword(newToken);

      // Calculate new expiration time (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_EXPIRY_DAYS);

      // Update session with new token
      const updatedSession = await this.prisma.session.update({
        where: { id: session.id },
        data: {
          refreshToken: newToken,
          refreshTokenHash: newTokenHash,
          expiresAt,
          lastActivityAt: new Date(),
        },
      });

      this.logger.log(`Refresh token rotated for session ${session.id}`);

      return {
        newToken,
        session: updatedSession,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Failed to rotate refresh token:', error);
      throw new UnauthorizedException('Failed to rotate refresh token');
    }
  }

  /**
   * Clean up expired sessions
   * 
   * Requirement 11.7: WHEN a session expires, THE Session_Manager SHALL require re-authentication
   * 
   * This method should be called periodically (e.g., via a cron job) to remove expired sessions
   * 
   * @returns Number of sessions deleted
   */
  async cleanupExpired(): Promise<number> {
    try {
      const now = new Date();

      const result = await this.prisma.session.deleteMany({
        where: {
          expiresAt: {
            lt: now,
          },
        },
      });

      if (result.count > 0) {
        this.logger.log(`Cleaned up ${result.count} expired sessions`);
      }

      return result.count;
    } catch (error) {
      this.logger.error('Failed to cleanup expired sessions:', error);
      throw error;
    }
  }
}
