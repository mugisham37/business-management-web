import { z } from 'zod';

// Email value object schema
export const EmailSchema = z
  .string()
  .email()
  .transform(email => email.toLowerCase().trim());

export type Email = z.infer<typeof EmailSchema>;

// Email value object class
export class EmailVO {
  private readonly _value: string;

  constructor(email: string) {
    const result = EmailSchema.safeParse(email);
    if (!result.success) {
      throw new Error(`Invalid email format: ${email}`);
    }
    this._value = result.data;
  }

  get value(): string {
    return this._value;
  }

  get domain(): string {
    return this._value.split('@')[1];
  }

  get localPart(): string {
    return this._value.split('@')[0];
  }

  equals(other: EmailVO): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  static create(email: string): EmailVO {
    return new EmailVO(email);
  }

  static isValid(email: string): boolean {
    return EmailSchema.safeParse(email).success;
  }
}
