// Warehouse Input Types
export * from './warehouse.input';

// Re-export input types from type files for convenience
export {
  CreateWarehouseInput,
  UpdateWarehouseInput,
  WarehouseFilterInput,
} from '../types/warehouse.types';

export {
  CreateWarehouseZoneInput,
  UpdateWarehouseZoneInput,
  WarehouseZoneFilterInput,
} from '../types/warehouse-zone.types';

export {
  CreateBinLocationInput,
  UpdateBinLocationInput,
  BinLocationFilterInput,
  BulkCreateBinLocationsInput,
} from '../types/bin-location.types';

export {
  CreatePickListInput,
  UpdatePickListInput,
  RecordPickInput,
} from '../types/pick-list.types';

export {
  CreatePickingWaveInput,
  UpdatePickingWaveInput,
  PickingWaveFilterInput,
  WavePlanningInput,
  AssignPickersInput,
} from '../types/picking-wave.types';

export {
  CreateLotInput,
  UpdateLotInput,
  CreateFIFORuleInput,
  CreateRecallInput,
  RecordLotMovementInput,
  LotFilterInput,
} from '../types/lot-tracking.types';

export {
  CreateKitDefinitionInput,
  CreateAssemblyWorkOrderInput,
  UpdateAssemblyWorkOrderInput,
  RecordQualityCheckInput,
  AllocateComponentInput,
  KitDefinitionFilterInput,
  AssemblyWorkOrderFilterInput,
  KitComponentInput,
  QualityCheckInput,
  PackagingInfoInput,
} from '../types/kitting-assembly.types';

export {
  CreateShipmentInput,
  GetShippingRatesInput,
  CreateShippingLabelInput,
  ShipmentFilterInput,
  ShippingAddressInput,
  ShipmentDimensionsInput,
  ShipmentItemInput,
} from '../types/shipping-integration.types';