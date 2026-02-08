import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class AssignRoleDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsEnum(['global', 'location', 'department'])
  @IsNotEmpty()
  scopeType!: 'global' | 'location' | 'department';

  @IsUUID()
  @IsOptional()
  locationId?: string;

  @IsUUID()
  @IsOptional()
  departmentId?: string;
}
