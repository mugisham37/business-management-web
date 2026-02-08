import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { OrganizationsService } from '../../organizations/organizations.service';
import { User } from '@prisma/client';

/**
 * Local Team Member Strategy for company code + username/password authentication
 * 
 * Requirement 6.1: WHEN a Team_Member submits company code, username, and password, 
 * THE Auth_System SHALL authenticate against the correct organization
 * 
 * Requirement 6.2: WHEN a Team_Member submits only username and password without 
 * company code, THE Auth_System SHALL reject authentication
 * 
 * This strategy handles team member login using company code, username, and password.
 * Primary owners should use the LocalStrategy with email only.
 */
@Injectable()
export class LocalTeamMemberStrategy extends PassportStrategy(Strategy, 'local-team-member') {
  private readonly logger = new Logger(LocalTeamMemberStrategy.name);

  constructor(
    private readonly authService: AuthService,
    private readonly organizations: OrganizationsService,
  ) {
    super({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true, // Enable access to request object to get company code
    });
  }

  /**
   * Validate team member credentials with company code
   * 
   * This method is called by Passport when a team member attempts to authenticate
   * using the local-team-member strategy. It requires a company code to identify
   * the organization, then validates the username and password within that context.
   * 
   * Requirement 6.2: Company code is required - authentication will fail without it
   * 
   * @param req - Request object containing company code
   * @param username - Username or email
   * @param password - Plain text password
   * @returns User object if valid
   * @throws UnauthorizedException if credentials are invalid or company code is missing
   */
  async validate(req: any, username: string, password: string): Promise<User> {
    // Extract company code from request body
    const companyCode = req.body?.companyCode;

    if (!companyCode) {
      this.logger.debug('Team member authentication failed: company code is required');
      throw new UnauthorizedException('Company code is required for team member login');
    }

    this.logger.debug(
      `Team member authentication attempt for username: ${username}, company code: ${companyCode}`,
    );

    // Find organization by company code
    const organization = await this.organizations.findByCompanyCode(companyCode);

    if (!organization) {
      this.logger.debug(`Team member authentication failed: invalid company code: ${companyCode}`);
      throw new UnauthorizedException('Invalid company code');
    }

    // Validate user credentials with organization context
    const user = await this.authService.validateUser(
      username,
      password,
      organization.id,
    );

    if (!user) {
      this.logger.debug(
        `Team member authentication failed for username: ${username}, organization: ${organization.id}`,
      );
      throw new UnauthorizedException('Invalid username or password');
    }

    // Verify user belongs to the organization
    if (user.organizationId !== organization.id) {
      this.logger.error(
        `Security violation: User ${user.id} does not belong to organization ${organization.id}`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(
      `Team member authentication successful for user: ${user.id}, organization: ${organization.id}`,
    );

    return user;
  }
}
