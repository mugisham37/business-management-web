import { BadRequestException } from '@nestjs/common';
import { ValidationPipe } from './validation.pipe';
import { IsString, IsEmail, MinLength, IsNotEmpty } from 'class-validator';

class TestDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @MinLength(8)
  password!: string;
}

describe('ValidationPipe', () => {
  let pipe: ValidationPipe;

  beforeEach(() => {
    pipe = new ValidationPipe();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  describe('transform', () => {
    it('should pass valid data', async () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = await pipe.transform(validData, {
        type: 'body',
        metatype: TestDto,
      });

      expect(result).toBeInstanceOf(TestDto);
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
    });

    it('should throw BadRequestException for invalid data', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        password: 'short',
      };

      await expect(
        pipe.transform(invalidData, {
          type: 'body',
          metatype: TestDto,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return formatted validation errors', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        password: 'short',
      };

      try {
        await pipe.transform(invalidData, {
          type: 'body',
          metatype: TestDto,
        });
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequestException);
        const response = error.getResponse() as any;
        expect(response.error).toBe('ValidationError');
        expect(response.message).toBe('Validation failed');
        expect(response.details).toBeDefined();
        expect(response.details.errors).toBeInstanceOf(Array);
        expect(response.details.errors.length).toBeGreaterThan(0);
      }
    });

    it('should strip non-whitelisted properties', async () => {
      const dataWithExtra = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        extraField: 'should be removed',
      };

      await expect(
        pipe.transform(dataWithExtra, {
          type: 'body',
          metatype: TestDto,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should skip validation for native types', async () => {
      const stringValue = 'test';

      const result = await pipe.transform(stringValue, {
        type: 'param',
        metatype: String,
      });

      expect(result).toBe(stringValue);
    });

    it('should skip validation when no metatype', async () => {
      const value = { test: 'data' };

      const result = await pipe.transform(value, {
        type: 'body',
      });

      expect(result).toEqual(value);
    });

    it('should include field names in validation errors', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        password: 'short',
      };

      try {
        await pipe.transform(invalidData, {
          type: 'body',
          metatype: TestDto,
        });
      } catch (error: any) {
        const response = error.getResponse() as any;
        const errorFields = response.details.errors.map((e: any) => e.field);
        expect(errorFields).toContain('name');
        expect(errorFields).toContain('email');
        expect(errorFields).toContain('password');
      }
    });

    it('should include constraint messages in validation errors', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        password: 'short',
      };

      try {
        await pipe.transform(invalidData, {
          type: 'body',
          metatype: TestDto,
        });
      } catch (error: any) {
        const response = error.getResponse() as any;
        const errors = response.details.errors;
        
        errors.forEach((error: any) => {
          expect(error.constraints).toBeDefined();
          expect(Object.keys(error.constraints).length).toBeGreaterThan(0);
        });
      }
    });
  });
});
