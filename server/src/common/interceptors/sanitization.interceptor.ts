import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { GqlExecutionContext } from '@nestjs/graphql';
import { sanitizeText, detectSQLInjection, detectXSS } from '../utils/sanitization.util';

/**
 * Interceptor to automatically sanitize input data
 * Provides defense-in-depth against SQL injection and XSS attacks
 */
@Injectable()
export class SanitizationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs();

    // Sanitize all string inputs in arguments
    if (args) {
      this.sanitizeObject(args);
    }

    return next.handle();
  }

  private sanitizeObject(obj: any): void {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];

        if (typeof value === 'string') {
          // Check for malicious patterns
          if (detectSQLInjection(value)) {
            console.warn(`Potential SQL injection detected in field: ${key}`);
          }
          if (detectXSS(value)) {
            console.warn(`Potential XSS detected in field: ${key}`);
          }

          // Sanitize the string (only for non-password fields)
          if (!key.toLowerCase().includes('password')) {
            obj[key] = sanitizeText(value);
          }
        } else if (typeof value === 'object') {
          // Recursively sanitize nested objects
          this.sanitizeObject(value);
        }
      }
    }
  }
}
