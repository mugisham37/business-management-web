import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

export interface GoogleProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  provider: 'google';
}

/**
 * Google OAuth 2.0 Strategy for Passport
 * Handles Google social authentication
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL');

    if (!clientID || !clientSecret) {
      throw new Error('Google OAuth credentials are required');
    }

    super({
      clientID,
      clientSecret,
      callbackURL: callbackURL || '/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  /**
   * Validate Google OAuth response
   * Called after successful OAuth authentication
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { id, name, emails, photos } = profile;
      
      const googleProfile: GoogleProfile = {
        id,
        email: emails?.[0]?.value || '',
        firstName: name?.givenName || '',
        lastName: name?.familyName || '',
        picture: photos?.[0]?.value || '',
        provider: 'google',
      };

      done(null, googleProfile);
    } catch (error) {
      done(error as any, false);
    }
  }
}