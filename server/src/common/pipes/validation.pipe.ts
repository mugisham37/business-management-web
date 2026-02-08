import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';

interface ValidationErrorDetail {
  field: string;
  constraints: Record<string, string>;
  children?: ValidationErrorDetail[];
}

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    // Skip validation if no metatype or if it's a native type
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Transform plain object to class instance
    const object = plainToInstance(metatype, value);

    // Validate the object
    const errors = await validate(object, {
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
      forbidUnknownValues: true, // Throw error for unknown values
      validationError: {
        target: false, // Don't include target in error
        value: false, // Don't include value in error (may contain sensitive data)
      },
    });

    if (errors.length > 0) {
      // Format validation errors
      const formattedErrors = this.formatErrors(errors);
      
      throw new BadRequestException({
        error: 'ValidationError',
        message: 'Validation failed',
        details: {
          errors: formattedErrors,
        },
      });
    }

    return object;
  }

  /**
   * Check if the metatype should be validated
   */
  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  /**
   * Format validation errors into a structured format
   */
  private formatErrors(errors: ValidationError[]): ValidationErrorDetail[] {
    return errors.map((error) => {
      const detail: ValidationErrorDetail = {
        field: error.property,
        constraints: error.constraints || {},
      };

      // Recursively format nested errors
      if (error.children && error.children.length > 0) {
        detail.children = this.formatErrors(error.children);
      }

      return detail;
    });
  }
}
