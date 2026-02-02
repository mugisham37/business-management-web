import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../services/auth.service';
import { AuthenticatedUser } from '../interfaces/auth.interface';

/**
 * Local Strategy for Passport
 * Used for username/password authentication
 * Validates credentials against the database
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email', // Use email instead of username
      passwordField: 'password',
    });
  }

  /**
   * Validate user credentials
   * Called when local strategy is invoked (e.g., POST /login)
   * Throws UnauthorizedException if credentials are invalid
   */
  async validate(email: string, password: string): Promise<AuthenticatedUser> {
    try {
      // Call the login method which validates credentials
      const result = await this.authService.login({ email, password, rememberMe: false });
      return result.user;
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
