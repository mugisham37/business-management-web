import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile, StrategyOptions } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || '',
      scope: ['email', 'profile'],
    } as StrategyOptions);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { id, emails, name, photos } = profile;

      if (!emails || emails.length === 0) {
        throw new UnauthorizedException('No email found in Google profile');
      }

      const email = emails[0].value;
      const firstName = name?.givenName || '';
      const lastName = name?.familyName || '';
      const googleId = id;

      // Return the Google profile data for further processing
      const user = {
        email,
        firstName,
        lastName,
        googleId,
        emailVerified: emails[0].verified || true,
        photo: photos && photos.length > 0 ? photos[0].value : null,
      };

      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
