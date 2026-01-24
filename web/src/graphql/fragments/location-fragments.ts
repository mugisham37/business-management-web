/**
 * Location GraphQL Fragments
 * Reusable fragments for location module queries
 */

import { gql } from '@apollo/client';

// Core Location Fragment
export const LOCATION_FRAGMENT = gql`
  fragment LocationFragment on Location {
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
    managerId
    latitude
    longitude
    squareFootage
    isActive
    createdAt
    updatedAt
  }
`;

// Location with Operating Hours Fragment
export const LOCATION_WITH_HOURS_FRAGMENT = gql`
  fragment LocationWithHoursFragment on Location {
    ...LocationFragment
    operatingHours {
      monday { open close closed }
      tuesday { open close closed }
      wednesday { open close closed }
      thursday { open close closed }
      friday { open close closed }
      saturday { open close closed }
      sunday { open close closed }
    }
  }
  ${LOCATION_FRAGMENT}
`;

// Location with Relationships Fragment
export const LOCATION_WITH_RELATIONSHIPS_FRAGMENT = gql`
  fragment LocationWithRelationshipsFragment on Location {
    ...LocationWithHoursFragment
    parentLocation {
      id
      name
      code
      locationType
    }
    childLocations {
      id
      name
      code
      locationType
      status
    }
  }
  ${LOCATION_WITH_HOURS_FRAGMENT}
`;

// Address Fragment
export const ADDRESS_FRAGMENT = gql`
  fragment AddressFragment on AddressType {
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
`;

// Operating Hours Fragment
export const OPERATING_HOURS_FRAGMENT = gql`
  fragment OperatingHoursFragment on OperatingHoursType {
    monday { open close closed }
    tuesday { open close closed }
    wednesday { open close closed }
    thursday { open close closed }
    friday { open close closed }
    saturday { open close closed }
    sunday { open close closed }
  }
`;

// Franchise Fragment
export const FRANCHISE_FRAGMENT = gql`
  fragment FranchiseFragment on FranchiseType {
    id
    name
    code
    performance
  }
`;

// Territory Fragment
export const TERRITORY_FRAGMENT = gql`
  fragment TerritoryFragment on TerritoryType {
    id
    name
    code
    locations
    manager
  }
`;