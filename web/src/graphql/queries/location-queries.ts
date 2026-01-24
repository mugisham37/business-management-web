/**
 * Location GraphQL Queries
 * Complete query definitions for location module integration
 */

import { gql } from '@apollo/client';

// Core Location Queries
export const GET_LOCATION = gql`
  query GetLocation($id: ID!) {
    location(id: $id) {
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
      parentLocation {
        id
        name
        code
      }
      childLocations {
        id
        name
        code
        locationType
        status
      }
    }
  }
`;

export const GET_LOCATIONS = gql`
  query GetLocations(
    $first: Int
    $after: String
    $filter: LocationFilterInput
  ) {
    locations(first: $first, after: $after, filter: $filter) {
      edges {
        node {
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
          parentLocationId
          timezone
          currency
          managerId
          latitude
          longitude
          squareFootage
          isActive
          createdAt
          updatedAt
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_LOCATION_TREE = gql`
  query GetLocationTree($rootLocationId: ID) {
    locationTree(rootLocationId: $rootLocationId) {
      id
      name
      code
      locationType
      status
      parentLocationId
      childLocations {
        id
        name
        code
        locationType
        status
        parentLocationId
        childLocations {
          id
          name
          code
          locationType
          status
        }
      }
    }
  }
`;

// Franchise Queries
export const GET_FRANCHISE = gql`
  query GetFranchise($id: ID!) {
    franchise(id: $id) {
      id
      name
      code
      performance
    }
  }
`;

export const GET_FRANCHISES = gql`
  query GetFranchises {
    franchises {
      id
      name
      code
      performance
    }
  }
`;

export const GET_FRANCHISE_PERFORMANCE = gql`
  query GetFranchisePerformance($id: ID!, $period: String) {
    getFranchisePerformance(id: $id, period: $period)
  }
`;

// Territory Queries
export const GET_TERRITORY = gql`
  query GetTerritory($id: ID!) {
    territory(id: $id) {
      id
      name
      code
      locations
      manager
    }
  }
`;

export const GET_TERRITORIES = gql`
  query GetTerritories {
    territories {
      id
      name
      code
      locations
      manager
    }
  }
`;

// Pricing Queries
export const GET_LOCATION_PRICING = gql`
  query GetLocationPricing($locationId: ID!, $productId: ID) {
    getLocationPricing(locationId: $locationId, productId: $productId)
  }
`;

export const GET_PRICING_RULES = gql`
  query GetPricingRules($locationId: ID!) {
    getPricingRules(locationId: $locationId)
  }
`;

// Promotion Queries
export const GET_LOCATION_PROMOTIONS = gql`
  query GetLocationPromotions($locationId: ID!) {
    locationPromotions(locationId: $locationId)
  }
`;

// Inventory Policy Queries
export const GET_INVENTORY_POLICY = gql`
  query GetInventoryPolicy($locationId: ID!) {
    getInventoryPolicy(locationId: $locationId)
  }
`;

export const GET_REORDER_RULES = gql`
  query GetReorderRules($locationId: ID!) {
    getReorderRules(locationId: $locationId)
  }
`;

// Reporting Queries
export const GET_LOCATION_SALES_REPORT = gql`
  query GetLocationSalesReport(
    $locationId: ID!
    $startDate: DateTime
    $endDate: DateTime
  ) {
    getLocationSalesReport(
      locationId: $locationId
      startDate: $startDate
      endDate: $endDate
    )
  }
`;

export const GET_LOCATION_INVENTORY_REPORT = gql`
  query GetLocationInventoryReport($locationId: ID!) {
    getLocationInventoryReport(locationId: $locationId)
  }
`;

export const GET_LOCATION_PERFORMANCE_REPORT = gql`
  query GetLocationPerformanceReport($locationId: ID!, $period: String) {
    getLocationPerformanceReport(locationId: $locationId, period: $period)
  }
`;

export const COMPARE_LOCATIONS = gql`
  query CompareLocations(
    $locationIds: [ID!]!
    $metrics: [String!]!
    $period: String
  ) {
    compareLocations(
      locationIds: $locationIds
      metrics: $metrics
      period: $period
    )
  }
`;

// Geospatial Queries
export const FIND_NEARBY_LOCATIONS = gql`
  query FindNearbyLocations(
    $latitude: Float!
    $longitude: Float!
    $radiusKm: Float!
    $maxResults: Int
    $locationTypes: [String!]
    $statuses: [String!]
  ) {
    findNearbyLocations(
      latitude: $latitude
      longitude: $longitude
      radiusKm: $radiusKm
      maxResults: $maxResults
      locationTypes: $locationTypes
      statuses: $statuses
    )
  }
`;

export const FIND_CLOSEST_LOCATION = gql`
  query FindClosestLocation(
    $latitude: Float!
    $longitude: Float!
    $locationTypes: [String!]
    $statuses: [String!]
  ) {
    findClosestLocation(
      latitude: $latitude
      longitude: $longitude
      locationTypes: $locationTypes
      statuses: $statuses
    )
  }
`;

export const FIND_LOCATIONS_IN_BOUNDS = gql`
  query FindLocationsInBounds(
    $northEastLat: Float!
    $northEastLng: Float!
    $southWestLat: Float!
    $southWestLng: Float!
    $locationTypes: [String!]
    $statuses: [String!]
  ) {
    findLocationsInBounds(
      northEastLat: $northEastLat
      northEastLng: $northEastLng
      southWestLat: $southWestLat
      southWestLng: $southWestLng
      locationTypes: $locationTypes
      statuses: $statuses
    )
  }
`;

export const CALCULATE_COVERAGE_AREA = gql`
  query CalculateCoverageArea($locationIds: [String!]!, $radiusKm: Float!) {
    calculateCoverageArea(locationIds: $locationIds, radiusKm: $radiusKm)
  }
`;

export const CLUSTER_LOCATIONS_BY_PROXIMITY = gql`
  query ClusterLocationsByProximity(
    $maxDistanceKm: Float!
    $minClusterSize: Int = 2
  ) {
    clusterLocationsByProximity(
      maxDistanceKm: $maxDistanceKm
      minClusterSize: $minClusterSize
    )
  }
`;

export const SUGGEST_OPTIMAL_LOCATION = gql`
  query SuggestOptimalLocation(
    $northEastLat: Float!
    $northEastLng: Float!
    $southWestLat: Float!
    $southWestLng: Float!
    $minDistanceFromExisting: Float!
    $populationDensityData: [JSONObject!]
  ) {
    suggestOptimalLocation(
      northEastLat: $northEastLat
      northEastLng: $northEastLng
      southWestLat: $southWestLat
      southWestLng: $southWestLng
      minDistanceFromExisting: $minDistanceFromExisting
      populationDensityData: $populationDensityData
    )
  }
`;

// Audit Queries
export const GET_LOCATION_AUDIT_HISTORY = gql`
  query GetLocationAuditHistory(
    $locationId: ID!
    $userId: ID
    $actions: [String!]
    $startDate: DateTime
    $endDate: DateTime
    $page: Int = 1
    $limit: Int = 50
  ) {
    getLocationAuditHistory(
      locationId: $locationId
      userId: $userId
      actions: $actions
      startDate: $startDate
      endDate: $endDate
      page: $page
      limit: $limit
    )
  }
`;

export const GET_LOCATION_AUDIT_SUMMARY = gql`
  query GetLocationAuditSummary($locationId: ID!, $days: Int = 30) {
    getLocationAuditSummary(locationId: $locationId, days: $days)
  }
`;

export const GET_TENANT_AUDIT_HISTORY = gql`
  query GetTenantAuditHistory(
    $locationId: ID
    $userId: ID
    $actions: [String!]
    $startDate: DateTime
    $endDate: DateTime
    $page: Int = 1
    $limit: Int = 50
  ) {
    getTenantAuditHistory(
      locationId: $locationId
      userId: $userId
      actions: $actions
      startDate: $startDate
      endDate: $endDate
      page: $page
      limit: $limit
    )
  }
`;

export const GET_COMPLIANCE_REPORT = gql`
  query GetComplianceReport($startDate: DateTime!, $endDate: DateTime!) {
    getComplianceReport(startDate: $startDate, endDate: $endDate)
  }
`;

// Bulk Operations Queries
export const GET_BULK_OPERATION_STATUS = gql`
  query GetBulkOperationStatus($operationId: ID!) {
    getBulkOperationStatus(operationId: $operationId)
  }
`;

export const GET_TENANT_BULK_OPERATIONS = gql`
  query GetTenantBulkOperations($limit: Int = 50) {
    getTenantBulkOperations(limit: $limit)
  }
`;

// Sync Queries
export const GET_SYNC_STATUS = gql`
  query GetSyncStatus($locationId: ID!) {
    getSyncStatus(locationId: $locationId)
  }
`;

export const GET_SYNC_HISTORY = gql`
  query GetSyncHistory($locationId: ID!, $limit: Int) {
    getSyncHistory(locationId: $locationId, limit: $limit)
  }
`;