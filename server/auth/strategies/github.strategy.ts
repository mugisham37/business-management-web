import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

export interface GitHubProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  provider: 'github';
}

/**
 * GitHub OAuth Strategy for Passport
 * Handles GitHub social authentication
 */
@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('GITHUB_CLIENT_ID');
    const clientSecret = configService.get<string>('GITHUB_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GITHUB_CALLBACK_URL');

    if (!clientID || !clientSecret) {
      throw new Error('GitHub OAuth credentials are required');
    }

    super({
      clientID,
      clientSecret,
      callbackURL: callbackURL || '/auth/github/callback',
      scope: ['user:email'],
    });
  }

  /**
   * Validate GitHub OAuth response
   * Called after successful OAuth authentication
   */
  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void,
  ): Promise<any> {
    try {
      const { id, displayName, emails, photos } = profile;
      
      // Parse display name into first and last name
      const nameParts = displayName?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const githubProfile: GitHubProfile = {
        id,
        email: emails?.[0]?.value || '',
        firstName,
        lastName,
        picture: photos?.[0]?.value || '',
        provider: 'github',
      };

      done(null, githubProfile);
    } catch (error) {
      done(error, null);
    }
  }
}