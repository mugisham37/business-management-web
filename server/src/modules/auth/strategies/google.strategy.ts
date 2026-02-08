import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';

/**
 * Google OAuth Strategy
 * 
 * Requirement 17.1: WHERE OAuth is configured, WHEN a user initiates OAuth login, 
 * THE Auth_System SHALL redirect to the provider's authorization endpoint
 * 
 * Requirement 17.6: WHERE OAuth is configured, THE Auth_System SHALL support 
 * Google and Microsoft providers
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      this.logger.warn('Google OAuth credentials not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
    }
  }

  /**
   * Validate OAuth callback
   * 
   * Requirement 17.2: WHERE OAuth is configured, WHEN the provider returns an 
   * authorization code, THE Auth_System SHALL exchange it for tokens
   * 
   * @param accessToken - OAuth access token from Google
   * @param refreshToken - OAuth refresh token from Google
   * @param profile - User profile from Google
   * @param done - Passport callback
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      // Extract user information from profile
      const { id, emails, name, photos } = profile;

      const email = emails && emails.length > 0 ? emails[0].value : null;

      if (!email) {
        this.logger.error('No email found in Google profile');
        return done(new Error('No email found in Google profile'), false);
      }

      // Prepare user data for OAuth service
      const oauthUser = {
        provider: 'google' as const,
        providerId: id,
        email,
        firstName: name?.givenName || '',
        lastName: name?.familyName || '',
        avatar: photos && photos.length > 0 ? photos[0].value : undefined,
        accessToken,
        refreshToken,
        profile: {
          id,
          displayName: profile.displayName,
          emails: profile.emails,
          photos: profile.photos,
        },
      };

      this.logger.log(`Google OAuth validation successful for email: ${email}`);

      done(null, oauthUser);
    } catch (error) {
      this.logger.error('Google OAuth validation failed:', error);
      done(error as Error, false);
    }
  }
}
