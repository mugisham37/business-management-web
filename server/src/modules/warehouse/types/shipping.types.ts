import { ObjectType, Field, ID, Float, InputType, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity, Edge, Connection } from '../../../common/graphql/base.types';
import { IsString, IsOptional, IsEnum, IsUUID, IsNumber, IsNotEmpty, IsArray, IsBoolean, IsEmail, Min, Max, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Enums
export enum CarrierType {
  UPS = 'ups',
  FEDEX = 'fedex',
  USPS = 'usps',
  DHL = 'dhl',
  CUSTOM = 'custom',
}

export enum ServiceType {
  GROUND = 'ground',
  NEXT_DAY = 'next_day',
  TWO_DAY = 'two_day',
  PRIORITY = 'priority',
  EXPRESS = 'express',
  OVERNIGHT = 'overnight',
  STANDARD = 'standard',
}

export enum ShipmentStatus {
  CREATED = 'created',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  EXCEPTION = 'exception',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

export enum LabelFormat {
  PDF = 'PDF',
  PNG = 'PNG',
  ZPL = 'ZPL',
  EPL = 'EPL',
}

export enum PackageType {
  BOX = 'box',
  ENVELOPE = 'envelope',
  TUBE = 'tube',
  PAK = 'pak',
  CUSTOM = 'custom',
}

registerEnumType(CarrierType, { name: 'CarrierType' });
registerEnumType(ServiceType, { name: 'ServiceType' });
registerEnumType(ShipmentStatus, { name: 'ShipmentStatus' });
registerEnumType(LabelFormat, { name: 'LabelFormat' });
registerEnumType(PackageType, { name: 'PackageType' });

// Object Types
@ObjectType('ShippingAddress')
export class ShippingAddressType {
  @Field()
  @ApiProperty({ description: 'Recipient or sender name' })
  name!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Company name', required: false })
  company?: string;

  @Field()
  @ApiProperty({ description: 'Address line 1' })
  addressLine1!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Address line 2', required: false })
  addressLine2?: string;

  @Field()
  @ApiProperty({ description: 'City' })
  city!: string;

  @Field()
  @ApiProperty({ description: 'State or province' })
  state!: string;

  @Field()
  @ApiProperty({ description: 'Postal or ZIP code' })
  postalCode!: string;

  @Field()
  @ApiProperty({ description: 'Country code (ISO 3166-1 alpha-2)' })
  country!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Phone number', required: false })
  phone?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Email address', required: false })
  email?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Address type', required: false })
  addressType?: string;
}

@ObjectType('PackageDimensions')
export class PackageDimensionsType {
  @Field(() => Float)
  @ApiProperty({ description: 'Length in inches' })
  length!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Width in inches' })
  width!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Height in inches' })
  height!: number;
}

@ObjectType('ShippingRate')
export class ShippingRateType {
  @Field()
  @ApiProperty({ description: 'Carrier ID' })
  carrierId!: string;

  @Field()
  @ApiProperty({ description: 'Carrier name' })
  carrierName!: string;

  @Field()
  @ApiProperty({ description: 'Service type' })
  serviceType!: string;

  @Field()
  @ApiProperty({ description: 'Service name' })
  serviceName!: string;

  @Field()
  @ApiProperty({ description: 'Estimated delivery date' })
  estimatedDeliveryDate!: Date;

  @Field(() => Float)
  @ApiProperty({ description: 'Transit days' })
  transitDays!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Shipping cost' })
  cost!: number;

  @Field()
  @ApiProperty({ description: 'Currency' })
  currency!: string;

  @Field()
  @ApiProperty({ description: 'Guaranteed delivery' })
  guaranteedDelivery!: boolean;

  @Field()
  @ApiProperty({ description: 'Tracking included' })
  trackingIncluded!: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Signature required', required: false })
  signatureRequired?: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Insurance included', required: false })
  insuranceIncluded?: boolean;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Maximum insurance value', required: false })
  maxInsuranceValue?: number;
}

@ObjectType('Shipment')
export class ShipmentType extends BaseEntity {
  @Field(() => ID)
  @ApiProperty({ description: 'Warehouse ID' })
  warehouseId!: string;

  @Field(() => ID, { nullable: true })
  @ApiProperty({ description: 'Order ID reference', required: false })
  orderId?: string;

  @Field(() => ID, { nullable: true })
  @ApiProperty({ description: 'Pick list ID reference', required: false })
  pickListId?: string;

  @Field()
  @ApiProperty({ description: 'Tracking number' })
  trackingNumber!: string;

  @Field(() => CarrierType)
  @ApiProperty({ description: 'Carrier ID', enum: CarrierType })
  carrierId!: CarrierType;

  @Field(() => ServiceType)
  @ApiProperty({ description: 'Service type', enum: ServiceType })
  serviceType!: ServiceType;

  @Field(() => ShippingAddressType)
  @ApiProperty({ description: 'Sender address' })
  fromAddress!: ShippingAddressType;

  @Field(() => ShippingAddressType)
  @ApiProperty({ description: 'Recipient address' })
  toAddress!: ShippingAddressType;

  @Field(() => PackageType)
  @ApiProperty({ description: 'Package type', enum: PackageType })
  packageType!: PackageType;

  @Field(() => Float)
  @ApiProperty({ description: 'Total weight in pounds' })
  weight!: number;

  @Field(() => PackageDimensionsType)
  @ApiProperty({ description: 'Package dimensions' })
  dimensions!: PackageDimensionsType;

  @Field(() => ShipmentStatus)
  @ApiProperty({ description: 'Shipment status', enum: ShipmentStatus })
  status!: ShipmentStatus;

  @Field(() => Float)
  @ApiProperty({ description: 'Shipping cost' })
  cost!: number;

  @Field()
  @ApiProperty({ description: 'Currency' })
  currency!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Label URL', required: false })
  labelUrl?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Estimated delivery', required: false })
  estimatedDelivery?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Delivered at', required: false })
  deliveredAt?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Special instructions', required: false })
  specialInstructions?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Reference number 1', required: false })
  reference1?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Reference number 2', required: false })
  reference2?: string;
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
export class ShippingAddressInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  company?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  addressLine1!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  addressLine2?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  city!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  state!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  postalCode!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  country!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  addressType?: string;
}

@InputType()
export class PackageDimensionsInput {
  @Field(() => Float)
  @IsNumber()
  @Min(0.1)
  @Max(108)
  length!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0.1)
  @Max(108)
  width!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0.1)
  @Max(108)
  height!: number;
}

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
  warehouseId!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  pickListId?: string;

  @Field(() => CarrierType)
  @IsEnum(CarrierType)
  carrierId!: CarrierType;

  @Field(() => ServiceType)
  @IsEnum(ServiceType)
  serviceType!: ServiceType;

  @Field(() => ShippingAddressInput)
  @ValidateNested()
  @Type(() => ShippingAddressInput)
  fromAddress!: ShippingAddressInput;

  @Field(() => ShippingAddressInput)
  @ValidateNested()
  @Type(() => ShippingAddressInput)
  toAddress!: ShippingAddressInput;

  @Field(() => PackageType)
  @IsEnum(PackageType)
  packageType!: PackageType;

  @Field(() => Float)
  @IsNumber()
  @Min(0.01)
  weight!: number;

  @Field(() => PackageDimensionsInput)
  @ValidateNested()
  @Type(() => PackageDimensionsInput)
  dimensions!: PackageDimensionsInput;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  declaredValue?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  signatureRequired?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  saturdayDelivery?: boolean;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  insuranceValue?: number;

  @Field(() => LabelFormat, { nullable: true })
  @IsOptional()
  @IsEnum(LabelFormat)
  labelFormat?: LabelFormat;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  returnLabel?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  specialInstructions?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  reference1?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  reference2?: string;
}

@InputType()
export class UpdateShipmentInput {
  @Field(() => ShipmentStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ShipmentStatus)
  status?: ShipmentStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  specialInstructions?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  reference1?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  reference2?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  notes?: string;
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

@InputType()
export class ShipmentFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => ShipmentStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ShipmentStatus)
  status?: ShipmentStatus;

  @Field(() => CarrierType, { nullable: true })
  @IsOptional()
  @IsEnum(CarrierType)
  carrierId?: CarrierType;

  @Field(() => ServiceType, { nullable: true })
  @IsOptional()
  @IsEnum(ServiceType)
  serviceType?: ServiceType;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  dateTo?: string;
}

@InputType()
export class ValidateAddressInput {
  @Field(() => ShippingAddressInput)
  @ValidateNested()
  @Type(() => ShippingAddressInput)
  address!: ShippingAddressInput;

  @Field(() => CarrierType, { nullable: true })
  @IsOptional()
  @IsEnum(CarrierType)
  carrierId?: CarrierType;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  returnSuggestions?: boolean;
}

// Connection Types
@ObjectType()
export class ShipmentEdge extends Edge<ShipmentType> {
  @Field(() => ShipmentType)
  node!: ShipmentType;
}

@ObjectType()
export class ShipmentConnection extends Connection<ShipmentType> {
  @Field(() => [ShipmentEdge])
  edges!: ShipmentEdge[];
}
