import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';

/**
 * Microsoft OAuth Strategy
 * 
 * Requirement 17.1: WHERE OAuth is configured, WHEN a user initiates OAuth login, 
 * THE Auth_System SHALL redirect to the provider's authorization endpoint
 * 
 * Requirement 17.6: WHERE OAuth is configured, THE Auth_System SHALL support 
 * Google and Microsoft providers
 */
@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  private readonly logger = new Logger(MicrosoftStrategy.name);

  constructor() {
    super({
      clientID: process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      callbackURL: process.env.MICROSOFT_CALLBACK_URL || 'http://localhost:3000/auth/microsoft/callback',
      scope: ['user.read'],
      tenant: process.env.MICROSOFT_TENANT || 'common',
    });

    if (!process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET) {
      this.logger.warn('Microsoft OAuth credentials not configured. Set MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET environment variables.');
    }
  }

  /**
   * Validate OAuth callback
   * 
   * Requirement 17.2: WHERE OAuth is configured, WHEN the provider returns an 
   * authorization code, THE Auth_System SHALL exchange it for tokens
   * 
   * @param accessToken - OAuth access token from Microsoft
   * @param refreshToken - OAuth refresh token from Microsoft
   * @param profile - User profile from Microsoft
   * @param done - Passport callback
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: any, user?: any) => void,
  ): Promise<void> {
    try {
      // Extract user information from profile
      const { id, emails, name, displayName } = profile;

      const email = emails && emails.length > 0 ? emails[0].value : null;

      if (!email) {
        this.logger.error('No email found in Microsoft profile');
        return done(new Error('No email found in Microsoft profile'), false);
      }

      // Parse name from displayName if name object not available
      let firstName = '';
      let lastName = '';

      if (name) {
        firstName = name.givenName || '';
        lastName = name.familyName || '';
      } else if (displayName) {
        const nameParts = displayName.split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      }

      // Prepare user data for OAuth service
      const oauthUser = {
        provider: 'microsoft' as const,
        providerId: id,
        email,
        firstName,
        lastName,
        avatar: undefined, // Microsoft profile doesn't include photo in basic scope
        accessToken,
        refreshToken,
        profile: {
          id,
          displayName: profile.displayName,
          emails: profile.emails,
        },
      };

      this.logger.log(`Microsoft OAuth validation successful for email: ${email}`);

      done(null, oauthUser);
    } catch (error) {
      this.logger.error('Microsoft OAuth validation failed:', error);
      done(error as Error, false);
    }
  }
}
