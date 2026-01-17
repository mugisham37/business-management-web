import { ObjectType, Field, ID, Int, Float, InputType, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity, Edge, Connection } from '../../../common/graphql/base.types';
import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsUUID, IsArray, IsDate, IsEmail, Min, Max, Length, IsNotEmpty, IsObject } from 'class-validator';

// Enums
export enum ShipmentStatus {
  PENDING = 'pending',
  CREATED = 'created',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  EXCEPTION = 'exception',
}

export enum CarrierType {
  UPS = 'ups',
  FEDEX = 'fedex',
  USPS = 'usps',
  DHL = 'dhl',
  CUSTOM = 'custom',
}

export enum ServiceType {
  GROUND = 'ground',
  EXPRESS = 'express',
  OVERNIGHT = 'overnight',
  TWO_DAY = 'two_day',
  INTERNATIONAL = 'international',
}

export enum LabelFormat {
  PDF = 'PDF',
  PNG = 'PNG',
  ZPL = 'ZPL',
}

export enum TrackingEventType {
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  EXCEPTION = 'exception',
  RETURNED = 'returned',
}

registerEnumType(ShipmentStatus, { name: 'ShipmentStatus' });
registerEnumType(CarrierType, { name: 'CarrierType' });
registerEnumType(ServiceType, { name: 'ServiceType' });
registerEnumType(LabelFormat, { name: 'LabelFormat' });
registerEnumType(TrackingEventType, { name: 'TrackingEventType' });

// Object Types
@ObjectType('ShippingAddress')
export class ShippingAddressType {
  @Field()
  @ApiProperty({ description: 'Recipient name' })
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
  @ApiProperty({ description: 'State/Province' })
  state!: string;

  @Field()
  @ApiProperty({ description: 'Postal code' })
  postalCode!: string;

  @Field()
  @ApiProperty({ description: 'Country code' })
  country!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Phone number', required: false })
  phone?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Email address', required: false })
  email?: string;
}

@ObjectType('ShipmentDimensions')
export class ShipmentDimensionsType {
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

@ObjectType('ShipmentItem')
export class ShipmentItemType {
  @Field(() => ID)
  @ApiProperty({ description: 'Product ID' })
  productId!: string;

  @Field()
  @ApiProperty({ description: 'SKU' })
  sku!: string;

  @Field()
  @ApiProperty({ description: 'Item description' })
  description!: string;

  @Field(() => Int)
  @ApiProperty({ description: 'Quantity' })
  quantity!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Weight in pounds' })
  weight!: number;

  @Field(() => ShipmentDimensionsType)
  @ApiProperty({ description: 'Item dimensions' })
  dimensions!: ShipmentDimensionsType;

  @Field(() => Float)
  @ApiProperty({ description: 'Item value' })
  value!: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Harmonized tariff code', required: false })
  harmonizedCode?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Country of origin', required: false })
  countryOfOrigin?: string;
}

@ObjectType('ShippingRate')
export class ShippingRateType {
  @Field(() => CarrierType)
  @ApiProperty({ description: 'Carrier type', enum: CarrierType })
  carrierId!: CarrierType;

  @Field()
  @ApiProperty({ description: 'Carrier name' })
  carrierName!: string;

  @Field(() => ServiceType)
  @ApiProperty({ description: 'Service type', enum: ServiceType })
  serviceType!: ServiceType;

  @Field()
  @ApiProperty({ description: 'Service name' })
  serviceName!: string;

  @Field()
  @ApiProperty({ description: 'Estimated delivery date' })
  estimatedDeliveryDate!: Date;

  @Field(() => Int)
  @ApiProperty({ description: 'Transit days' })
  transitDays!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Shipping cost' })
  cost!: number;

  @Field()
  @ApiProperty({ description: 'Currency code' })
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

@ObjectType('ShippingLabel')
export class ShippingLabelType extends BaseEntity {
  @Field()
  @ApiProperty({ description: 'Tracking number' })
  trackingNumber!: string;

  @Field(() => CarrierType)
  @ApiProperty({ description: 'Carrier type', enum: CarrierType })
  carrierId!: CarrierType;

  @Field(() => ServiceType)
  @ApiProperty({ description: 'Service type', enum: ServiceType })
  serviceType!: ServiceType;

  @Field(() => LabelFormat)
  @ApiProperty({ description: 'Label format', enum: LabelFormat })
  labelFormat!: LabelFormat;

  @Field()
  @ApiProperty({ description: 'Base64 encoded label data' })
  labelData!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Label URL', required: false })
  labelUrl?: string;

  @Field(() => Float)
  @ApiProperty({ description: 'Shipping cost' })
  cost!: number;

  @Field()
  @ApiProperty({ description: 'Currency code' })
  currency!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Label expiration date', required: false })
  expiresAt?: Date;
}

@ObjectType('TrackingLocation')
export class TrackingLocationType {
  @Field({ nullable: true })
  @ApiProperty({ description: 'City', required: false })
  city?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'State/Province', required: false })
  state?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Country', required: false })
  country?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Postal code', required: false })
  postalCode?: string;
}

@ObjectType('TrackingEvent')
export class TrackingEventType extends BaseEntity {
  @Field()
  @ApiProperty({ description: 'Tracking number' })
  trackingNumber!: string;

  @Field(() => TrackingEventType)
  @ApiProperty({ description: 'Event type', enum: TrackingEventType })
  eventType!: TrackingEventType;

  @Field()
  @ApiProperty({ description: 'Event description' })
  eventDescription!: string;

  @Field()
  @ApiProperty({ description: 'Event date' })
  eventDate!: Date;

  @Field(() => TrackingLocationType, { nullable: true })
  @ApiProperty({ description: 'Event location', required: false })
  location?: TrackingLocationType;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Carrier event code', required: false })
  carrierEventCode?: string;

  @Field()
  @ApiProperty({ description: 'Is delivered' })
  isDelivered!: boolean;

  @Field()
  @ApiProperty({ description: 'Is exception' })
  isException!: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Exception reason', required: false })
  exceptionReason?: string;
}

@ObjectType('Shipment')
export class ShipmentType extends BaseEntity {
  @Field()
  @ApiProperty({ description: 'Shipment number' })
  shipmentNumber!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Warehouse ID' })
  warehouseId!: string;

  @Field(() => ID, { nullable: true })
  @ApiProperty({ description: 'Order ID', required: false })
  orderId?: string;

  @Field(() => ID, { nullable: true })
  @ApiProperty({ description: 'Pick list ID', required: false })
  pickListId?: string;

  @Field(() => CarrierType)
  @ApiProperty({ description: 'Carrier type', enum: CarrierType })
  carrierId!: CarrierType;

  @Field(() => ServiceType)
  @ApiProperty({ description: 'Service type', enum: ServiceType })
  serviceType!: ServiceType;

  @Field(() => ShippingAddressType)
  @ApiProperty({ description: 'From address' })
  fromAddress!: ShippingAddressType;

  @Field(() => ShippingAddressType)
  @ApiProperty({ description: 'To address' })
  toAddress!: ShippingAddressType;

  @Field(() => [ShipmentItemType])
  @ApiProperty({ description: 'Shipment items', type: [ShipmentItemType] })
  items!: ShipmentItemType[];

  @Field()
  @ApiProperty({ description: 'Package type' })
  packageType!: string;

  @Field(() => Float)
  @ApiProperty({ description: 'Total weight' })
  weight!: number;

  @Field(() => ShipmentDimensionsType)
  @ApiProperty({ description: 'Package dimensions' })
  dimensions!: ShipmentDimensionsType;

  @Field(() => ShipmentStatus)
  @ApiProperty({ description: 'Shipment status', enum: ShipmentStatus })
  status!: ShipmentStatus;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Tracking number', required: false })
  trackingNumber?: string;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Shipping cost', required: false })
  shippingCost?: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Currency code', required: false })
  currency?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Estimated delivery date', required: false })
  estimatedDeliveryDate?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Actual delivery date', required: false })
  actualDeliveryDate?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Shipped date', required: false })
  shippedDate?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Delivery confirmation', required: false })
  deliveryConfirmation?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Insurance value', required: false })
  insuranceValue?: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Signature required', required: false })
  signatureRequired?: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Saturday delivery', required: false })
  saturdayDelivery?: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Shipment notes', required: false })
  notes?: string;
}

@ObjectType('ShippingMetrics')
export class ShippingMetricsType {
  @Field(() => ID)
  @ApiProperty({ description: 'Warehouse ID' })
  warehouseId!: string;

  @Field(() => Int)
  @ApiProperty({ description: 'Total shipments' })
  totalShipments!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Average shipping cost' })
  averageShippingCost!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'On-time delivery rate' })
  onTimeDeliveryRate!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Damage rate' })
  damageRate!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Average transit time' })
  averageTransitTime!: number;

  @Field(() => [String])
  @ApiProperty({ description: 'Top carriers', type: [String] })
  topCarriers!: string[];

  @Field(() => Float)
  @ApiProperty({ description: 'Cost per shipment' })
  costPerShipment!: number;
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
  @Length(2, 3)
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
}

@InputType()
export class ShipmentDimensionsInput {
  @Field(() => Float)
  @IsNumber()
  @Min(0.1)
  @Max(999)
  length!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0.1)
  @Max(999)
  width!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0.1)
  @Max(999)
  height!: number;
}

@InputType()
export class ShipmentItemInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  sku!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  description!: string;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  quantity!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0.01)
  weight!: number;

  @Field(() => ShipmentDimensionsInput)
  dimensions!: ShipmentDimensionsInput;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  value!: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  harmonizedCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 3)
  countryOfOrigin?: string;
}

@InputType()
export class CreateShipmentInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  shipmentNumber!: string;

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
  fromAddress!: ShippingAddressInput;

  @Field(() => ShippingAddressInput)
  toAddress!: ShippingAddressInput;

  @Field(() => [ShipmentItemInput])
  @IsArray()
  @IsNotEmpty()
  items!: ShipmentItemInput[];

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  packageType!: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0.01)
  weight!: number;

  @Field(() => ShipmentDimensionsInput)
  dimensions!: ShipmentDimensionsInput;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  deliveryConfirmation?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  insuranceValue?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  signatureRequired?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  saturdayDelivery?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;
}

@InputType()
export class GetShippingRatesInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  warehouseId!: string;

  @Field(() => ShippingAddressInput)
  fromAddress!: ShippingAddressInput;

  @Field(() => ShippingAddressInput)
  toAddress!: ShippingAddressInput;

  @Field(() => [ShipmentItemInput])
  @IsArray()
  @IsNotEmpty()
  items!: ShipmentItemInput[];

  @Field()
  @IsString()
  @IsNotEmpty()
  packageType!: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0.01)
  weight!: number;

  @Field(() => ShipmentDimensionsInput)
  dimensions!: ShipmentDimensionsInput;

  @Field(() => [CarrierType], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(CarrierType, { each: true })
  carriers?: CarrierType[];
}

@InputType()
export class CreateShippingLabelInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  shipmentId!: string;

  @Field(() => LabelFormat, { nullable: true })
  @IsOptional()
  @IsEnum(LabelFormat)
  labelFormat?: LabelFormat;
}

@InputType()
export class ShipmentFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @Field(() => ShipmentStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ShipmentStatus)
  status?: ShipmentStatus;

  @Field(() => CarrierType, { nullable: true })
  @IsOptional()
  @IsEnum(CarrierType)
  carrierId?: CarrierType;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  trackingNumber?: string;
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

@ObjectType()
export class TrackingEventEdge extends Edge<TrackingEventType> {
  @Field(() => TrackingEventType)
  node!: TrackingEventType;
}

@ObjectType()
export class TrackingEventConnection extends Connection<TrackingEventType> {
  @Field(() => [TrackingEventEdge])
  edges!: TrackingEventEdge[];
}