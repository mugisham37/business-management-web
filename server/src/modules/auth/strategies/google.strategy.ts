import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { SocialAuthService } from '../services/social-auth.service';

/**
 * Google OAuth 2.0 Strategy
 * 
 * Implements Passport's Google OAuth strategy for social authentication.
 * Allows users to sign in using their Google accounts.
 * 
 * Features:
 * - Google OAuth 2.0 integration
 * - Automatic user creation for new Google users
 * - Profile information extraction (name, email, avatar)
 * - Tenant-aware user management
 * 
 * Configuration required:
 * - GOOGLE_CLIENT_ID: Google OAuth client ID
 * - GOOGLE_CLIENT_SECRET: Google OAuth client secret
 * - GOOGLE_CALLBACK_URL: OAuth callback URL
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly socialAuthService: SocialAuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL', '/auth/google/callback'),
      scope: ['email', 'profile'],
    });
  }

  /**
   * Validate Google OAuth callback
   * 
   * @param accessToken - Google access token
   * @param refreshToken - Google refresh token
   * @param profile - Google user profile
   * @param done - Passport callback function
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      // Extract user information from Google profile
      const { id, name, emails, photos } = profile;
      
      const email = emails?.[0]?.value;
      if (!email) {
        return done(new Error('No email found in Google profile'), null);
      }

      // Prepare social auth data
      const socialAuthData = {
        provider: 'google' as const,
        providerId: id,
        email,
        firstName: name?.givenName || '',
        lastName: name?.familyName || '',
        displayName: name?.displayName || `${name?.givenName || ''} ${name?.familyName || ''}`.trim(),
        avatar: photos?.[0]?.value || null,
        accessToken,
        refreshToken,
        profile: {
          id,
          name,
          emails,
          photos,
          provider: profile.provider,
          _raw: profile._raw,
          _json: profile._json,
        },
      };

      // Handle social authentication (create or find user)
      const user = await this.socialAuthService.handleSocialAuth(socialAuthData);
      
      return done(null, user);
    } catch (error) {
      console.error('Google strategy validation failed:', {
        profileId: profile?.id,
        email: profile?.emails?.[0]?.value,
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      return done(error, null);
    }
  }
}