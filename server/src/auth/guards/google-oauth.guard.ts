import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Google OAuth Guard
 * Protects routes that initiate Google OAuth2 authentication
 */
@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  constructor() {
    super({
      accessType: 'offline',
      prompt: 'consent',
    });
  }
}
