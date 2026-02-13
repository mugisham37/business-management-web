import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateBranchDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;
}
