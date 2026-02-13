import { IsEmail, IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateWorkerDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[];
}
