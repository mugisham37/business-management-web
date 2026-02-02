import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DrizzleService } from '../../database/drizzle.service';
import { CacheService } from '../../cache/cache.service';
import { CustomLoggerService } from '../../logger/logger.service';
import { userSessions } from '../../database/schema';
import { 
  SessionInfo, 
  DeviceFingerprint,
  GeoLocation,
} from '../interfaces/auth.interface';
import { eq, and, gt, lt, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';

export interface CreateSessionInput {
  userId: string;
  tenantId: string;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: DeviceFingerprint;
  rememberMe?: boolean;
}

export interface SessionSecurityCheck {
  isValid: boolean;
  reason?: string;
  riskScore: number;
  requiresReauth?: boolean;
}

@Injectable()
export class SessionService {
  private readonly sessionConfig: {
    maxSessions: number;
    sessionTimeout: number; // milliseconds
    rememberMeTimeout: number; // milliseconds
    cleanupInterval: number; // milliseconds
    extendOnActivity: boolean;
    requireReauthHours: number;
  };

  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly cacheService: CacheService,
    private readonly logger: CustomLoggerService,
  ) {
    this.sessionConfig = {
      maxSessions: this.configService.get<number>('MAX_SESSIONS_PER_USER', 5),
      sessionTimeout: this.parseTimeString(this.configService.get<string>('SESSION_TIMEOUT', '15m')),
      rememberMeTimeout: this.parseTimeString(this.configService.get<string>('REMEMBER_ME_TIMEOUT', '30d')),
      cleanupInterval: this.parseTimeString(this.configService.get<string>('SESSION_CLEANUP_INTERVAL', '1h')),
      extendOnActivity: this.configService.get<boolean>('SESSION_EXTEND_ON_ACTIVITY', true),
      requireReauthHours: this.configService.get<number>('SESSION_REQUIRE_REAUTH_HOURS', 24),
    };

    this.logger.setContext('SessionService');

    // Start session cleanup interval
    this.startSessionCleanup();
  }

  /**
   * Create a new user session with enhanced security
   */
  async createSession(input: CreateSessionInput): Promise<SessionInfo> {
    const db = this.drizzleService.getDb();

    try {
      // Check session limits
      await this.enforceSessionLimits(input.userId);

      // Generate session tokens
      const sessionId = uuidv4();
      const sessionToken = uuidv4();
      const refreshToken = await this.generateRefreshToken(input.userId, sessionId, input.rememberMe);

      // Calculate expiration
      const expiresAt = new Date(
        Date.now() + (input.rememberMe ? this.sessionConfig.rememberMeTimeout : this.sessionConfig.sessionTimeout)
      );

      // Get location from IP
      const location = input.ipAddress ? await this.getLocationFromIP(input.ipAddress) : undefined;

      // Calculate initial trust and risk scores
      const trustScore = this.calculateInitialTrustScore(input);
      const riskScore = this.calculateInitialRiskScore(input);

      // Create session record
      await db.insert(userSessions).values({
        id: sessionId,
        tenantId: input.tenantId,
        userId: input.userId,
        sessionToken,
        refreshToken,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        deviceInfo: {
          fingerprint: input.deviceFingerprint?.hash,
          trustScore: input.deviceFingerprint?.trustScore || 0,
          platform: input.deviceFingerprint?.platform,
          rememberMe: input.rememberMe || false,
        },
        expiresAt,
        lastAccessedAt: new Date(),
        isRevoked: false,
        createdBy: input.userId,
        updatedBy: input.userId,
      });

      // Cache session for quick access
      await this.cacheSession(sessionId, {
        id: sessionId,
        userId: input.userId,
        sessionToken,
        refreshToken,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        deviceInfo: {
          fingerprint: input.deviceFingerprint?.hash,
          trustScore: input.deviceFingerprint?.trustScore || 0,
          platform: input.deviceFingerprint?.platform,
          rememberMe: input.rememberMe || false,
        },
        location,
        expiresAt,
        lastAccessedAt: new Date(),
        isRevoked: false,
        trustScore,
        riskScore,
        mfaVerified: false,
        networkTrust: this.calculateNetworkTrust(input.ipAddress),
      });

      // Log session creation
      this.logger.log(`Session created for user ${input.userId}`, {
        sessionId,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        trustScore,
        riskScore,
      });

      // Emit session created event
      this.eventEmitter.emit('session.created', {
        sessionId,
        userId: input.userId,
        tenantId: input.tenantId,
        ipAddress: input.ipAddress,
        trustScore,
        riskScore,
        timestamp: new Date(),
      });

      return {
        id: sessionId,
        userId: input.userId,
        sessionToken,
        refreshToken,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        deviceInfo: {
          fingerprint: input.deviceFingerprint?.hash,
          trustScore: input.deviceFingerprint?.trustScore || 0,
          platform: input.deviceFingerprint?.platform,
          rememberMe: input.rememberMe || false,
        },
        location,
        expiresAt,
        lastAccessedAt: new Date(),
        isRevoked: false,
        trustScore,
        riskScore,
        mfaVerified: false,
        networkTrust: this.calculateNetworkTrust(input.ipAddress),
      };
    } catch (error) {
      this.logger.error(`Failed to create session for user ${input.userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get session information with security validation
   */
  async getSessionInfo(sessionId: string): Promise<SessionInfo | null> {
    try {
      // Try cache first
      const cached = await this.getCachedSession(sessionId);
      if (cached) {
        return cached;
      }

      // Fallback to database
      const db = this.drizzleService.getDb();
      const [session] = await db
        .select()
        .from(userSessions)
        .where(and(
          eq(userSessions.id, sessionId),
          eq(userSessions.isRevoked, false),
          gt(userSessions.expiresAt, new Date())
        ))
        .limit(1);

      if (!session) {
        return null;
      }

      const sessionInfo: SessionInfo = {
        id: session.id,
        userId: session.userId,
        sessionToken: session.sessionToken,
        refreshToken: session.refreshToken,
        ipAddress: session.ipAddress || undefined,
        userAgent: session.userAgent || undefined,
        deviceInfo: session.deviceInfo as Record<string, any>,
        expiresAt: session.expiresAt,
        lastAccessedAt: session.lastAccessedAt || new Date(),
        isRevoked: session.isRevoked || false,
        trustScore: 70, // Default trust score
        riskScore: 30, // Default risk score
        mfaVerified: false,
        networkTrust: this.calculateNetworkTrust(session.ipAddress),
      };

      // Cache for future requests
      await this.cacheSession(sessionId, sessionInfo);

      return sessionInfo;
    } catch (error) {
      this.logger.error(`Failed to get session info for ${sessionId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Validate session and return session info if valid
   */
  async validateSession(sessionId: string, currentIpAddress?: string, currentUserAgent?: string): Promise<SessionInfo | null> {
    try {
      // First check if session exists and is valid
      const sessionInfo = await this.getSessionInfo(sessionId);
      
      if (!sessionInfo) {
        return null;
      }

      // Perform security validation
      const securityCheck = await this.validateSessionSecurity(sessionId, currentIpAddress, currentUserAgent);
      
      if (!securityCheck.isValid) {
        // If session is invalid due to security reasons, revoke it
        if (securityCheck.reason?.includes('expired') || securityCheck.reason?.includes('revoked')) {
          await this.revokeSession(sessionId, securityCheck.reason);
        }
        return null;
      }

      // If requires re-authentication but session is still valid, return session info
      // The calling code can decide whether to require re-auth based on the security context
      if (securityCheck.requiresReauth) {
        sessionInfo.riskScore = securityCheck.riskScore;
      }

      return sessionInfo;
    } catch (error) {
      this.logger.error(`Session validation failed for ${sessionId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Validate session security
   */
  async validateSessionSecurity(
    sessionId: string,
    currentIpAddress?: string,
    currentUserAgent?: string
  ): Promise<SessionSecurityCheck> {
    try {
      const session = await this.getSessionInfo(sessionId);
      
      if (!session) {
        return {
          isValid: false,
          reason: 'Session not found',
          riskScore: 100,
        };
      }

      // Check if session is expired
      if (session.expiresAt < new Date()) {
        return {
          isValid: false,
          reason: 'Session expired',
          riskScore: 100,
        };
      }

      // Check if session is revoked
      if (session.isRevoked) {
        return {
          isValid: false,
          reason: 'Session revoked',
          riskScore: 100,
        };
      }

      let riskScore = session.riskScore || 30;
      const securityIssues: string[] = [];

      // IP address validation
      if (currentIpAddress && session.ipAddress && currentIpAddress !== session.ipAddress) {
        riskScore += 30;
        securityIssues.push('IP address changed');
      }

      // User agent validation (basic check)
      if (currentUserAgent && session.userAgent && !this.isUserAgentSimilar(currentUserAgent, session.userAgent)) {
        riskScore += 20;
        securityIssues.push('User agent changed');
      }

      // Session age check
      const sessionAge = Date.now() - session.lastAccessedAt.getTime();
      const maxInactivity = this.sessionConfig.requireReauthHours * 60 * 60 * 1000;
      
      if (sessionAge > maxInactivity) {
        return {
          isValid: false,
          reason: 'Session requires re-authentication',
          riskScore: riskScore + 40,
          requiresReauth: true,
        };
      }

      // Update last accessed time if extending on activity
      if (this.sessionConfig.extendOnActivity) {
        await this.updateSessionActivity(sessionId);
      }

      const isValid = riskScore < 80; // Threshold for session validity

      return {
        isValid,
        reason: isValid ? undefined : `Security risk detected: ${securityIssues.join(', ')}`,
        riskScore: Math.min(100, riskScore),
        requiresReauth: riskScore > 60,
      };
    } catch (error) {
      this.logger.error(`Session security validation failed for ${sessionId}: ${error.message}`);
      
      return {
        isValid: false,
        reason: 'Security validation failed',
        riskScore: 100,
      };
    }
  }

  /**
   * Update session activity timestamp
   */
  async updateSessionActivity(sessionId: string): Promise<void> {
    const db = this.drizzleService.getDb();
    
    try {
      await db
        .update(userSessions)
        .set({
          lastAccessedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userSessions.id, sessionId));

      // Update cache
      const cached = await this.getCachedSession(sessionId);
      if (cached) {
        cached.lastAccessedAt = new Date();
        await this.cacheSession(sessionId, cached);
      }
    } catch (error) {
      this.logger.error(`Failed to update session activity for ${sessionId}: ${error.message}`);
    }
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: string, reason: string = 'user_logout'): Promise<void> {
    const db = this.drizzleService.getDb();

    try {
      await db
        .update(userSessions)
        .set({
          isRevoked: true,
          revokedAt: new Date(),
          revokedReason: reason,
          updatedAt: new Date(),
        })
        .where(eq(userSessions.id, sessionId));

      // Remove from cache
      await this.removeCachedSession(sessionId);

      // Log session revocation
      this.logger.log(`Session revoked: ${sessionId}`, { reason });

      // Emit session revoked event
      this.eventEmitter.emit('session.revoked', {
        sessionId,
        reason,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Failed to revoke session ${sessionId} with reason ${reason}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Revoke all sessions for a user
   */
  async revokeAllUserSessions(userId: string, reason: string = 'logout_all_sessions'): Promise<void> {
    const db = this.drizzleService.getDb();

    try {
      // Get all active sessions for the user
      const sessions = await db
        .select({ id: userSessions.id })
        .from(userSessions)
        .where(and(
          eq(userSessions.userId, userId),
          eq(userSessions.isRevoked, false)
        ));

      // Revoke all sessions
      await db
        .update(userSessions)
        .set({
          isRevoked: true,
          revokedAt: new Date(),
          revokedReason: reason,
          updatedAt: new Date(),
        })
        .where(and(
          eq(userSessions.userId, userId),
          eq(userSessions.isRevoked, false)
        ));

      // Remove from cache
      for (const session of sessions) {
        await this.removeCachedSession(session.id);
      }

      this.logger.log(`All sessions revoked for user: ${userId}`, { 
        reason, 
        sessionCount: sessions.length 
      });

      // Emit event
      this.eventEmitter.emit('sessions.revoked_all', {
        userId,
        reason,
        sessionCount: sessions.length,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Failed to revoke all user sessions for ${userId} with reason ${reason}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get active sessions for a user
   */
  async getUserActiveSessions(userId: string): Promise<SessionInfo[]> {
    const db = this.drizzleService.getDb();

    try {
      const sessions = await db
        .select()
        .from(userSessions)
        .where(and(
          eq(userSessions.userId, userId),
          eq(userSessions.isRevoked, false),
          gt(userSessions.expiresAt, new Date())
        ))
        .orderBy(desc(userSessions.lastAccessedAt));

      return sessions.map(session => ({
        id: session.id,
        userId: session.userId,
        sessionToken: session.sessionToken,
        refreshToken: session.refreshToken,
        ipAddress: session.ipAddress || undefined,
        userAgent: session.userAgent || undefined,
        deviceInfo: session.deviceInfo as Record<string, any>,
        expiresAt: session.expiresAt,
        lastAccessedAt: session.lastAccessedAt || new Date(),
        isRevoked: session.isRevoked || false,
        trustScore: 70, // Default trust score
        riskScore: 30, // Default risk score
        mfaVerified: false,
        networkTrust: this.calculateNetworkTrust(session.ipAddress),
      }));
    } catch (error) {
      this.logger.error(`Failed to get user active sessions for ${userId}: ${error.message}`);
      return [];
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    const db = this.drizzleService.getDb();

    try {
      const expiredSessions = await db
        .select({ id: userSessions.id })
        .from(userSessions)
        .where(and(
          eq(userSessions.isRevoked, false),
          lt(userSessions.expiresAt, new Date())
        ));

      if (expiredSessions.length === 0) {
        return 0;
      }

      // Mark as revoked
      await db
        .update(userSessions)
        .set({
          isRevoked: true,
          revokedAt: new Date(),
          revokedReason: 'expired',
          updatedAt: new Date(),
        })
        .where(and(
          eq(userSessions.isRevoked, false),
          lt(userSessions.expiresAt, new Date())
        ));

      // Remove from cache
      for (const session of expiredSessions) {
        await this.removeCachedSession(session.id);
      }

      this.logger.log(`Cleaned up ${expiredSessions.length} expired sessions`);

      return expiredSessions.length;
    } catch (error) {
      this.logger.error(`Failed to cleanup expired sessions: ${error.message}`);
      return 0;
    }
  }

  // Private helper methods

  private async enforceSessionLimits(userId: string): Promise<void> {
    const activeSessions = await this.getUserActiveSessions(userId);
    
    if (activeSessions.length >= this.sessionConfig.maxSessions) {
      // Revoke oldest session
      const oldestSession = activeSessions[activeSessions.length - 1];
      await this.revokeSession(oldestSession.id, 'session_limit_exceeded');
    }
  }

  private async generateRefreshToken(userId: string, sessionId: string, rememberMe?: boolean): Promise<string> {
    const payload = {
      sub: userId,
      sessionId,
      type: 'refresh',
      rememberMe: rememberMe || false,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60), // 30 days or 7 days
    };

    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET not configured');
    }

    return jwt.sign(payload, secret);
  }

  private calculateInitialTrustScore(input: CreateSessionInput): number {
    let score = 50; // Base score

    // Device fingerprint trust
    if (input.deviceFingerprint) {
      score += (input.deviceFingerprint.trustScore || 0) * 0.3;
    }

    // Network trust
    const networkTrust = this.calculateNetworkTrust(input.ipAddress);
    score += networkTrust * 0.2;

    return Math.min(100, Math.max(0, score));
  }

  private calculateInitialRiskScore(input: CreateSessionInput): number {
    let score = 30; // Base risk

    // Unknown device increases risk
    if (!input.deviceFingerprint || input.deviceFingerprint.trustScore < 50) {
      score += 20;
    }

    // Untrusted network increases risk
    const networkTrust = this.calculateNetworkTrust(input.ipAddress);
    if (networkTrust < 50) {
      score += 15;
    }

    return Math.min(100, Math.max(0, score));
  }

  private calculateNetworkTrust(ipAddress?: string): number {
    if (!ipAddress) return 50;

    // Check if IP is in trusted networks
    const trustedNetworks = this.configService.get<string[]>('TRUSTED_NETWORKS', []);
    const isTrusted = trustedNetworks.some(network => this.isIPInNetwork(ipAddress, network));
    
    return isTrusted ? 90 : 50;
  }

  private isIPInNetwork(ip: string, network: string): boolean {
    // Simplified CIDR check - would use proper IP library in production
    return network.includes(ip.split('.').slice(0, 3).join('.'));
  }

  private isUserAgentSimilar(current: string, stored: string): boolean {
    // Basic similarity check - would use more sophisticated comparison in production
    const currentParts = current.split(' ');
    const storedParts = stored.split(' ');
    
    // Check if browser and major version are the same
    const currentBrowser = currentParts.find(part => part.includes('Chrome') || part.includes('Firefox') || part.includes('Safari'));
    const storedBrowser = storedParts.find(part => part.includes('Chrome') || part.includes('Firefox') || part.includes('Safari'));
    
    return currentBrowser === storedBrowser;
  }

  private async cacheSession(sessionId: string, session: SessionInfo): Promise<void> {
    const key = `session:${sessionId}`;
    await this.cacheService.set(key, session, { ttl: 60 * 60 }); // 1 hour cache
  }

  private async getCachedSession(sessionId: string): Promise<SessionInfo | null> {
    const key = `session:${sessionId}`;
    return await this.cacheService.get<SessionInfo>(key);
  }

  private async removeCachedSession(sessionId: string): Promise<void> {
    const key = `session:${sessionId}`;
    await this.cacheService.del(key);
  }

  private parseTimeString(timeStr: string): number {
    const unit = timeStr.slice(-1);
    const value = parseInt(timeStr.slice(0, -1));

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 15 * 60 * 1000; // 15 minutes default
    }
  }

  private async getLocationFromIP(ipAddress: string): Promise<GeoLocation> {
    // Would integrate with IP geolocation service
    return {
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      timezone: 'UTC',
    };
  }

  private startSessionCleanup(): void {
    setInterval(async () => {
      try {
        const cleaned = await this.cleanupExpiredSessions();
        if (cleaned > 0) {
          this.logger.log(`Session cleanup completed: ${cleaned} sessions cleaned`);
        }
      } catch (error) {
        this.logger.error(`Session cleanup failed: ${error.message}`);
      }
    }, this.sessionConfig.cleanupInterval);
  }
}