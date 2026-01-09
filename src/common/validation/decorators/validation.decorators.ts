import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Custom validator for UUID format
 */
@ValidatorConstraint({ name: 'isUuid', async: false })
export class IsUuidConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (typeof value !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a valid UUID`;
  }
}

/**
 * Custom UUID validation decorator
 */
export function IsUuid(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUuidConstraint,
    });
  };
}

/**
 * Custom validator for business tier enum
 */
@ValidatorConstraint({ name: 'isBusinessTier', async: false })
export class IsBusinessTierConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    const validTiers = ['micro', 'small', 'medium', 'enterprise'];
    return validTiers.includes(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be one of: micro, small, medium, enterprise`;
  }
}

/**
 * Business tier validation decorator
 */
export function IsBusinessTier(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsBusinessTierConstraint,
    });
  };
}

/**
 * Custom validator for tenant slug format
 */
@ValidatorConstraint({ name: 'isTenantSlug', async: false })
export class IsTenantSlugConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (typeof value !== 'string') return false;
    // Slug must be lowercase, alphanumeric, and hyphens only, 3-50 characters
    const slugRegex = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;
    return slugRegex.test(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a valid slug (lowercase, alphanumeric, hyphens only, 3-50 characters)`;
  }
}

/**
 * Tenant slug validation decorator
 */
export function IsTenantSlug(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsTenantSlugConstraint,
    });
  };
}

/**
 * Custom validator for phone numbers
 */
@ValidatorConstraint({ name: 'isPhoneNumber', async: false })
export class IsPhoneNumberConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (typeof value !== 'string') return false;
    // Basic international phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a valid phone number`;
  }
}

/**
 * Phone number validation decorator
 */
export function IsPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPhoneNumberConstraint,
    });
  };
}

/**
 * Custom validator for currency codes
 */
@ValidatorConstraint({ name: 'isCurrencyCode', async: false })
export class IsCurrencyCodeConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (typeof value !== 'string') return false;
    // ISO 4217 currency code format (3 uppercase letters)
    const currencyRegex = /^[A-Z]{3}$/;
    return currencyRegex.test(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a valid ISO 4217 currency code (e.g., USD, EUR, GBP)`;
  }
}

/**
 * Currency code validation decorator
 */
export function IsCurrencyCode(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCurrencyCodeConstraint,
    });
  };
}

/**
 * Custom validator for timezone strings
 */
@ValidatorConstraint({ name: 'isTimezone', async: false })
export class IsTimezoneConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (typeof value !== 'string') return false;
    try {
      // Check if timezone is valid by trying to create a date with it
      Intl.DateTimeFormat(undefined, { timeZone: value });
      return true;
    } catch {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a valid timezone (e.g., America/New_York, Europe/London)`;
  }
}

/**
 * Timezone validation decorator
 */
export function IsTimezone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsTimezoneConstraint,
    });
  };
}

/**
 * Custom validator for monetary amounts (positive numbers with up to 2 decimal places)
 */
@ValidatorConstraint({ name: 'isMonetaryAmount', async: false })
export class IsMonetaryAmountConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (typeof value !== 'number') return false;
    if (value < 0) return false;
    // Check if it has at most 2 decimal places
    return Number.isInteger(value * 100);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a positive number with at most 2 decimal places`;
  }
}

/**
 * Monetary amount validation decorator
 */
export function IsMonetaryAmount(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsMonetaryAmountConstraint,
    });
  };
}

/**
 * Custom validator for SKU format
 */
@ValidatorConstraint({ name: 'isSku', async: false })
export class IsSkuConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (typeof value !== 'string') return false;
    // SKU format: alphanumeric, hyphens, underscores, 3-50 characters
    const skuRegex = /^[A-Za-z0-9_-]{3,50}$/;
    return skuRegex.test(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a valid SKU (alphanumeric, hyphens, underscores, 3-50 characters)`;
  }
}

/**
 * SKU validation decorator
 */
export function IsSku(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsSkuConstraint,
    });
  };
}

/**
 * Custom validator for hex color codes
 */
@ValidatorConstraint({ name: 'isHexColor', async: false })
export class IsHexColorConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (typeof value !== 'string') return false;
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexColorRegex.test(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a valid hex color code (e.g., #FF0000, #f00)`;
  }
}

/**
 * Hex color validation decorator
 */
export function IsHexColor(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsHexColorConstraint,
    });
  };
}