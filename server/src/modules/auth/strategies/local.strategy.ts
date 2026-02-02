import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../services/auth.service';
import { AuthenticatedUser } from '../interfaces/auth.interface';

/**
 * Local Authentication Strategy
 * 
 * Implements Passport's local strategy for username/password authentication.
 * Used for login endpoints where users provide email/username and password.
 * 
 * Features:
 * - Email/username and password validation
 * - Account lockout protection
 * - Failed login attempt tracking
 * - Integration with AuthService for credential validation
 * 
 * The strategy expects:
 * - username field: email or username
 * - password field: password
 * 
 * Returns authenticated user object on success or throws UnauthorizedException on failure.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email', // Can be 'email' or 'username'
      passwordField: 'password',
      passReqToCallback: false,
    });
  }

  /**
   * Validate user credentials
   * 
   * @param email - User's email or username
   * @param password - User's password
   * @returns Authenticated user object
   * @throws UnauthorizedException if credentials are invalid
   */
  async validate(email: string, password: string): Promise<AuthenticatedUser> {
    try {
      // Validate credentials using AuthService
      const user = await this.authService.validateCredentials(email, password);
      
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Return user object (password should already be excluded by AuthService)
      return user;
    } catch (error) {
      // Log failed login attempt
      console.error('Local strategy validation failed:', {
        email,
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      throw new UnauthorizedException('Invalid credentials');
    }
  }
}