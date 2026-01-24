/**
 * Location GraphQL Mutations
 * Complete mutation definitions for location module integration
 */

import { gql } from '@apollo/client';

// Core Location Mutations
export const CREATE_LOCATION = gql`
  mutation CreateLocation($input: CreateLocationInput!) {
    createLocation(input: $input) {
      id
      name
      code
      description
      locationType
      status
      address {
        street
        city
        state
        country
        postalCode
        coordinates {
          latitude
          longitude
        }
      }
      phone
      email
      website
      parentLocationId
      timezone
      currency
      operatingHours {
        monday { open close closed }
        tuesday { open close closed }
        wednesday { open close closed }
        thursday { open close closed }
        friday { open close closed }
        saturday { open close closed }
        sunday { open close closed }
      }
      managerId
      latitude
      longitude
      squareFootage
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_LOCATION = gql`
  mutation UpdateLocation($id: ID!, $input: UpdateLocationInput!) {
    updateLocation(id: $id, input: $input) {
      id
      name
      code
      description
      locationType
      status
      address {
        street
        city
        state
        country
        postalCode
        coordinates {
          latitude
          longitude
        }
      }
      phone
      email
      website
      parentLocationId
      timezone
      currency
      operatingHours {
        monday { open close closed }
        tuesday { open close closed }
        wednesday { open close closed }
        thursday { open close closed }
        friday { open close closed }
        saturday { open close closed }
        sunday { open close closed }
      }
      managerId
      latitude
      longitude
      squareFootage
      isActive
      updatedAt
    }
  }
`;

export const DELETE_LOCATION = gql`
  mutation DeleteLocation($id: ID!) {
    deleteLocation(id: $id)
  }
`;

export const CLOSE_LOCATION = gql`
  mutation CloseLocation($id: ID!) {
    closeLocation(id: $id) {
      id
      status
      updatedAt
    }
  }
`;

// Franchise Mutations
export const CREATE_FRANCHISE = gql`
  mutation CreateFranchise($input: JSONObject!) {
    createFranchise(input: $input) {
      id
      name
      code
      performance
    }
  }
`;

export const UPDATE_FRANCHISE = gql`
  mutation UpdateFranchise($id: ID!, $input: JSONObject!) {
    updateFranchise(id: $id, input: $input) {
      id
      name
      code
      performance
    }
  }
`;

// Territory Mutations
export const CREATE_TERRITORY = gql`
  mutation CreateTerritory($input: JSONObject!) {
    createTerritory(input: $input) {
      id
      name
      code
      locations
      manager
    }
  }
`;

export const UPDATE_TERRITORY = gql`
  mutation UpdateTerritory($id: ID!, $input: JSONObject!) {
    updateTerritory(id: $id, input: $input) {
      id
      name
      code
      locations
      manager
    }
  }
`;

export const ASSIGN_LOCATION_TO_TERRITORY = gql`
  mutation AssignLocationToTerritory($territoryId: ID!, $locationId: ID!) {
    assignLocationToTerritory(territoryId: $territoryId, locationId: $locationId)
  }
`;

// Pricing Mutations
export const UPDATE_LOCATION_PRICING = gql`
  mutation UpdateLocationPricing(
    $locationId: ID!
    $pricing: JSONObject!
  ) {
    updateLocationPricing(locationId: $locationId, pricing: $pricing)
  }
`;

export const APPLY_PRICING_RULE = gql`
  mutation ApplyPricingRule($locationId: ID!, $ruleId: ID!) {
    applyPricingRule(locationId: $locationId, ruleId: $ruleId)
  }
`;

// Promotion Mutations
export const CREATE_LOCATION_PROMOTION = gql`
  mutation CreateLocationPromotion(
    $locationId: ID!
    $promotion: JSONObject!
  ) {
    createLocationPromotion(locationId: $locationId, promotion: $promotion)
  }
`;

export const ACTIVATE_PROMOTION = gql`
  mutation ActivatePromotion($promotionId: ID!) {
    activatePromotion(promotionId: $promotionId)
  }
`;

export const DEACTIVATE_PROMOTION = gql`
  mutation DeactivatePromotion($promotionId: ID!) {
    deactivatePromotion(promotionId: $promotionId)
  }
`;

// Inventory Policy Mutations
export const UPDATE_INVENTORY_POLICY = gql`
  mutation UpdateInventoryPolicy(
    $locationId: ID!
    $policy: JSONObject!
  ) {
    updateInventoryPolicy(locationId: $locationId, policy: $policy)
  }
`;

export const UPDATE_REORDER_RULES = gql`
  mutation UpdateReorderRules(
    $locationId: ID!
    $rules: JSONObject!
  ) {
    updateReorderRules(locationId: $locationId, rules: $rules)
  }
`;

// Bulk Operations Mutations
export const BULK_CREATE_LOCATIONS = gql`
  mutation BulkCreateLocations(
    $locations: [JSONObject!]!
    $validateOnly: Boolean = false
    $continueOnError: Boolean = false
  ) {
    bulkCreateLocations(
      locations: $locations
      validateOnly: $validateOnly
      continueOnError: $continueOnError
    )
  }
`;

export const BULK_UPDATE_LOCATIONS = gql`
  mutation BulkUpdateLocations(
    $updates: [JSONObject!]!
    $validateOnly: Boolean = false
    $continueOnError: Boolean = false
  ) {
    bulkUpdateLocations(
      updates: $updates
      validateOnly: $validateOnly
      continueOnError: $continueOnError
    )
  }
`;

export const BULK_CHANGE_LOCATION_STATUS = gql`
  mutation BulkChangeLocationStatus(
    $locationIds: [ID!]!
    $newStatus: LocationStatus!
    $reason: String
    $validateOnly: Boolean = false
    $continueOnError: Boolean = false
  ) {
    bulkChangeLocationStatus(
      locationIds: $locationIds
      newStatus: $newStatus
      reason: $reason
      validateOnly: $validateOnly
      continueOnError: $continueOnError
    )
  }
`;

export const BULK_DELETE_LOCATIONS = gql`
  mutation BulkDeleteLocations(
    $locationIds: [ID!]!
    $reason: String
    $validateOnly: Boolean = false
    $continueOnError: Boolean = false
  ) {
    bulkDeleteLocations(
      locationIds: $locationIds
      reason: $reason
      validateOnly: $validateOnly
      continueOnError: $continueOnError
    )
  }
`;

export const CANCEL_BULK_OPERATION = gql`
  mutation CancelBulkOperation($operationId: ID!) {
    cancelBulkOperation(operationId: $operationId)
  }
`;

// Sync Mutations
export const TRIGGER_SYNC = gql`
  mutation TriggerSync($locationId: ID!, $syncType: String) {
    triggerSync(locationId: $locationId, syncType: $syncType)
  }
`;

export const RESOLVE_SYNC_CONFLICT = gql`
  mutation ResolveSyncConflict(
    $conflictId: ID!
    $resolution: JSONObject!
  ) {
    resolveSyncConflict(conflictId: $conflictId, resolution: $resolution)
  }
`;