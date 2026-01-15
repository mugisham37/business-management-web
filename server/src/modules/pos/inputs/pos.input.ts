import { InputType, Field, ID, Float } from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@InputType({ description: 'Input for opening a POS session' })
export class OpenPOSSessionInput {
  @Field(() => ID)
  @ApiProperty({ description: 'Location ID' })
  @IsString()
  locationId!: string;

  @Field(() => Float)
  @ApiProperty({ description: 'Opening cash amount', minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  openingCash!: number;

  @Field({ nullable: true })
  @ApiPropertyOptional({ description: 'Session notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType({ description: 'Input for closing a POS session' })
export class ClosePOSSessionInput {
  @Field(() => Float)
  @ApiProperty({ description: 'Closing cash amount', minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  closingCash!: number;

  @Field({ nullable: true })
  @ApiPropertyOptional({ description: 'Closing notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
