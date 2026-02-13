import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

export class CreateManagerDto {
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
  @ArrayMinSize(1, { message: 'Manager must be assigned to at least one branch or department' })
  @IsOptional()
  branchIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  departmentIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[];
}
