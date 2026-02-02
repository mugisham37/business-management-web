import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import { SocialAuthService } from '../services/social-auth.service';

/**
 * Facebook OAuth Strategy
 * 
 * Implements Passport's Facebook OAuth strategy for social authentication.
 * Allows users to sign in using their Facebook accounts.
 * 
 * Features:
 * - Facebook OAuth integration
 * - Automatic user creation for new Facebook users
 * - Profile information extraction (name, email, avatar)
 * - Tenant-aware user management
 * 
 * Configuration required:
 * - FACEBOOK_APP_ID: Facebook App ID
 * - FACEBOOK_APP_SECRET: Facebook App Secret
 * - FACEBOOK_CALLBACK_URL: OAuth callback URL
 */
@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  private readonly logger = new Logger(FacebookStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly socialAuthService: SocialAuthService,
  ) {
    const clientID = configService.get<string>('FACEBOOK_APP_ID');
    const clientSecret = configService.get<string>('FACEBOOK_APP_SECRET');
    
    // Use placeholder values if not configured (strategy won't work but won't crash)
    super({
      clientID: clientID && !clientID.includes('your_') ? clientID : 'disabled',
      clientSecret: clientSecret && !clientSecret.includes('your_') ? clientSecret : 'disabled',
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL', '/auth/facebook/callback'),
      scope: ['email', 'public_profile'],
      profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
    });

    if (!clientID || clientID.includes('your_') || !clientSecret || clientSecret.includes('your_')) {
      this.logger.warn('Facebook OAuth is not configured. Set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET to enable.');
    }
  }

  /**
   * Validate Facebook OAuth callback
   * 
   * @param accessToken - Facebook access token
   * @param refreshToken - Facebook refresh token (usually null for Facebook)
   * @param profile - Facebook user profile
   * @param done - Passport callback function
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void,
  ): Promise<void> {
    try {
      // Extract user information from Facebook profile
      const { id, name, emails, photos } = profile;
      
      const email = emails?.[0]?.value;
      if (!email) {
        return done(new Error('No email found in Facebook profile'), null);
      }

      // Prepare social auth data
      const socialAuthData = {
        provider: 'facebook' as const,
        providerId: id,
        email,
        firstName: name?.givenName || '',
        lastName: name?.familyName || '',
        displayName: `${name?.givenName || ''} ${name?.familyName || ''}`.trim() || 'Facebook User',
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
      console.error('Facebook strategy validation failed:', {
        profileId: profile?.id,
        email: profile?.emails?.[0]?.value,
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      return done(error, null);
    }
  }
}