import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserInfo } from '../../common/decorators/current-user.decorator';

/**
 * Sessions Controller
 * 
 * Provides REST API endpoints for session management operations:
 * - List active sessions for current user
 * - Revoke specific session
 * 
 * Requirements: 11.2, 11.3
 */
@Controller('sessions')
export class SessionsController {
  private readonly logger = new Logger(SessionsController.name);

  constructor(private readonly sessionsService: SessionsService) {}

  /**
   * Get all active sessions for current user
   * 
   * GET /sessions
   * 
   * Requirement 11.2: WHEN a user has multiple active sessions, THE Session_Manager 
   * SHALL track each session independently
   * 
   * @param user - Current authenticated user from JWT
   * @returns List of active sessions
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserSessions(@CurrentUser() user: CurrentUserInfo) {
    this.logger.log(`Get sessions request for user: ${user.id}`);

    const sessions = await this.sessionsService.findUserSessions(user.id);

    // Sanitize sessions - remove sensitive data
    const sanitizedSessions = sessions.map(session => ({
      id: session.id,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      deviceFingerprint: session.deviceFingerprint,
      location: session.location,
      lastActivityAt: session.lastActivityAt,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
    }));

    return {
      success: true,
      data: sanitizedSessions,
    };
  }

  /**
   * Revoke a specific session
   * 
   * DELETE /sessions/:id
   * 
   * Requirement 11.3: WHEN a user requests session revocation, THE Session_Manager 
   * SHALL invalidate the specified session within 1 second
   * 
   * @param id - Session ID to revoke
   * @param user - Current authenticated user from JWT
   * @returns Success response
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async revokeSession(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserInfo,
  ) {
    this.logger.log(`Revoke session request for session: ${id} by user: ${user.id}`);

    // First, verify the session belongs to the current user
    const session = await this.sessionsService.findById(id);

    if (!session) {
      return {
        success: false,
        error: 'Session not found',
      };
    }

    if (session.userId !== user.id) {
      return {
        success: false,
        error: 'Unauthorized to revoke this session',
      };
    }

    // Revoke the session
    await this.sessionsService.revoke(id, 'User requested session revocation');

    return {
      success: true,
      message: 'Session revoked successfully',
    };
  }
}
