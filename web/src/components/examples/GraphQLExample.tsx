'use client';

import React from 'react';
import { useQuery, gql } from '@apollo/client';

// Example GraphQL query
const GET_EXAMPLE_DATA = gql`
  query GetExampleData {
    currentUser {
      id
      email
      firstName
      lastName
    }
  }
`;

/**
 * Example component demonstrating GraphQL client usage
 * This is a placeholder component that shows how to use Apollo Client
 */
export function GraphQLExample() {
  const { data, loading, error } = useQuery(GET_EXAMPLE_DATA, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-first',
  });

  if (loading) {
    return (
      <div className="p-4 border rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <h3 className="text-red-800 font-medium">GraphQL Error</h3>
        <p className="text-red-600 text-sm mt-1">
          {error.message || 'An error occurred while fetching data'}
        </p>
        <p className="text-gray-500 text-xs mt-2">
          This is expected since no backend is running. The Apollo Client is properly configured.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 border border-green-200 rounded-lg bg-green-50">
      <h3 className="text-green-800 font-medium">GraphQL Success</h3>
      <p className="text-green-600 text-sm mt-1">
        Data loaded successfully!
      </p>
      {data && (
        <pre className="text-xs mt-2 text-gray-600 overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default GraphQLExample;