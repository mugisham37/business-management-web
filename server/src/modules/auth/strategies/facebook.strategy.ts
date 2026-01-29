import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

export interface FacebookProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  provider: 'facebook';
}

/**
 * Facebook OAuth Strategy for Passport
 * Handles Facebook social authentication
 */
@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('FACEBOOK_APP_ID');
    const clientSecret = configService.get<string>('FACEBOOK_APP_SECRET');
    const callbackURL = configService.get<string>('FACEBOOK_CALLBACK_URL');

    if (!clientID || !clientSecret) {
      throw new Error('Facebook OAuth credentials are required');
    }

    super({
      clientID,
      clientSecret,
      callbackURL: callbackURL || '/auth/facebook/callback',
      scope: ['email'],
      profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
    });
  }

  /**
   * Validate Facebook OAuth response
   * Called after successful OAuth authentication
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void,
  ): Promise<any> {
    try {
      const { id, name, emails, photos } = profile;
      
      const facebookProfile: FacebookProfile = {
        id,
        email: emails?.[0]?.value || '',
        firstName: name?.givenName || '',
        lastName: name?.familyName || '',
        picture: photos?.[0]?.value || '',
        provider: 'facebook',
      };

      done(null, facebookProfile);
    } catch (error) {
      done(error, null);
    }
  }
}