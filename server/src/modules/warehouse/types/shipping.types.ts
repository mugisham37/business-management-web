import { ObjectType, Field, ID, Float, InputType, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID, IsNumber, IsNotEmpty, Min } from 'class-validator';

// Enums
export enum ShipmentStatus {
  PENDING = 'pending',
  LABEL_CREATED = 'label_created',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  EXCEPTION = 'exception',
}

registerEnumType(ShipmentStatus, { name: 'ShipmentStatus' });

// Object Types
@ObjectType('ShippingRate')
export class ShippingRateType {
  @Field()
  @ApiProperty({ description: 'Carrier name' })
  carrier!: string;

  @Field()
  @ApiProperty({ description: 'Service name' })
  service!: string;

  @Field(() => Float)
  @ApiProperty({ description: 'Rate amount' })
  rate!: number;

  @Field()
  @ApiProperty({ description: 'Currency' })
  currency!: string;

  @Field()
  @ApiProperty({ description: 'Estimated delivery date' })
  estimatedDelivery!: Date;
}

@ObjectType('Shipment')
export class ShipmentType {
  @Field(() => ID)
  @ApiProperty({ description: 'Shipment ID' })
  shipmentId!: string;

  @Field()
  @ApiProperty({ description: 'Tracking number' })
  trackingNumber!: string;

  @Field()
  @ApiProperty({ description: 'Carrier' })
  carrier!: string;

  @Field()
  @ApiProperty({ description: 'Service' })
  service!: string;

  @Field(() => ShipmentStatus)
  @ApiProperty({ description: 'Status', enum: ShipmentStatus })
  status!: ShipmentStatus;

  @Field(() => Float)
  @ApiProperty({ description: 'Cost' })
  cost!: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Label URL', required: false })
  labelUrl?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Estimated delivery', required: false })
  estimatedDelivery?: Date;
}

@ObjectType('TrackingInfo')
export class TrackingInfoType {
  @Field()
  @ApiProperty({ description: 'Tracking number' })
  trackingNumber!: string;

  @Field(() => ShipmentStatus)
  @ApiProperty({ description: 'Status', enum: ShipmentStatus })
  status!: ShipmentStatus;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Current location', required: false })
  currentLocation?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Estimated delivery', required: false })
  estimatedDelivery?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Delivered at', required: false })
  deliveredAt?: Date;
}

// Input Types
@InputType()
export class GetShippingRatesInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  orderId!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  toZipCode!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  toCountry!: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  weight!: number;
}

@InputType()
export class CreateShipmentInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  orderId!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  carrier!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  service!: string;
}

@InputType()
export class SchedulePickupInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  shipmentId!: string;

  @Field()
  pickupDate!: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  instructions?: string;
}
