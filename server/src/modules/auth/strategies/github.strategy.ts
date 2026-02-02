import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { SocialAuthService } from '../services/social-auth.service';

/**
 * GitHub OAuth Strategy
 * 
 * Implements Passport's GitHub OAuth strategy for social authentication.
 * Allows users to sign in using their GitHub accounts.
 * 
 * Features:
 * - GitHub OAuth integration
 * - Automatic user creation for new GitHub users
 * - Profile information extraction (name, email, avatar)
 * - Tenant-aware user management
 * 
 * Configuration required:
 * - GITHUB_CLIENT_ID: GitHub OAuth App client ID
 * - GITHUB_CLIENT_SECRET: GitHub OAuth App client secret
 * - GITHUB_CALLBACK_URL: OAuth callback URL
 */
@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly configService: ConfigService,
    private readonly socialAuthService: SocialAuthService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL', '/auth/github/callback'),
      scope: ['user:email', 'read:user'],
    });
  }

  /**
   * Validate GitHub OAuth callback
   * 
   * @param accessToken - GitHub access token
   * @param refreshToken - GitHub refresh token
   * @param profile - GitHub user profile
   * @param done - Passport callback function
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void,
  ): Promise<void> {
    try {
      // Extract user information from GitHub profile
      const { id, username, displayName, emails, photos, _json } = profile;
      
      // GitHub might not provide email in the profile if it's private
      // We'll need to handle this case
      const email = emails?.[0]?.value || _json?.email;
      if (!email) {
        return done(new Error('No email found in GitHub profile. Please make your email public in GitHub settings.'), null);
      }

      // Parse name from displayName or use username as fallback
      const nameParts = displayName ? displayName.split(' ') : [username];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Prepare social auth data
      const socialAuthData = {
        provider: 'github' as const,
        providerId: id,
        email,
        firstName,
        lastName,
        displayName: displayName || username || '',
        avatar: photos?.[0]?.value || _json?.avatar_url || null,
        accessToken,
        refreshToken,
        profile: {
          id,
          username,
          displayName,
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
      console.error('GitHub strategy validation failed:', {
        profileId: profile?.id,
        username: profile?.username,
        email: profile?.emails?.[0]?.value || profile?._json?.email,
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      return done(error, null);
    }
  }
}