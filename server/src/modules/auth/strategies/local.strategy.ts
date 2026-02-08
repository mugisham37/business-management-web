import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { User } from '@prisma/client';

/**
 * Local Strategy for email/password authentication (Primary Owner login)
 * 
 * Requirement 3.1: WHEN a user submits valid email and password credentials, 
 * THE Auth_System SHALL authenticate the user and return access and refresh tokens
 * 
 * This strategy handles primary owner login using email and password.
 * Team members should use the LocalTeamMemberStrategy with company code.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email', // Use 'email' instead of default 'username'
      passwordField: 'password',
    });
  }

  /**
   * Validate user credentials for primary owner login
   * 
   * This method is called by Passport when a user attempts to authenticate
   * using the local strategy. It validates the email and password, and returns
   * the user object if valid.
   * 
   * @param email - User email address
   * @param password - Plain text password
   * @returns User object if valid
   * @throws UnauthorizedException if credentials are invalid
   */
  async validate(email: string, password: string): Promise<User> {
    this.logger.debug(`Local authentication attempt for email: ${email}`);

    // Validate user credentials (no organization context for primary owners)
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      this.logger.debug(`Local authentication failed for email: ${email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    this.logger.log(`Local authentication successful for user: ${user.id}`);

    return user;
  }
}
