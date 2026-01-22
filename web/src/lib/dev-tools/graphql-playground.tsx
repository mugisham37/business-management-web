/**
 * GraphQL Playground Integration
 * Development-mode GraphQL playground for API exploration
 * Requirements: 10.6
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useApolloClient } from '@apollo/client';
import { gql } from '@apollo/client';

interface PlaygroundQuery {
  id: string;
  name: string;
  query: string;
  variables: string;
  headers: string;
}

interface PlaygroundResult {
  data?: any;
  errors?: any[];
  loading: boolean;
  networkStatus?: number;
}

export function GraphQLPlayground() {
  const client = useApolloClient();
  const [isOpen, setIsOpen] = useState(false);
  const [queries, setQueries] = useState<PlaygroundQuery[]>([]);
  const [activeQuery, setActiveQuery] = useState<PlaygroundQuery | null>(null);
  const [result, setResult] = useState<PlaygroundResult>({ loading: false });
  const [schema, setSchema] = useState<any>(null);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  useEffect(() => {
    // Load saved queries from localStorage
    const savedQueries = localStorage.getItem('graphql-playground-queries');
    if (savedQueries) {
      try {
        setQueries(JSON.parse(savedQueries));
      } catch (error) {
        console.error('Failed to load saved queries:', error);
      }
    }

    // Load schema introspection
    loadSchema();
  }, []);

  const loadSchema = async () => {
    try {
      const introspectionQuery = gql`
        query IntrospectionQuery {
          __schema {
            types {
              name
              kind
              description
              fields {
                name
                type {
                  name
                  kind
                }
              }
            }
          }
        }
      `;

      const result = await client.query({
        query: introspectionQuery,
        fetchPolicy: 'network-only',
      });

      setSchema(result.data.__schema);
    } catch (error) {
      console.error('Failed to load GraphQL schema:', error);
    }
  };

  const executeQuery = async () => {
    if (!activeQuery) return;

    setResult({ loading: true });

    try {
      const variables = activeQuery.variables ? JSON.parse(activeQuery.variables) : {};
      const context = activeQuery.headers ? JSON.parse(activeQuery.headers) : {};

      const queryResult = await client.query({
        query: gql(activeQuery.query),
        variables,
        context,
        fetchPolicy: 'network-only',
      });

      setResult({
        data: queryResult.data,
        loading: false,
        networkStatus: queryResult.networkStatus,
      });
    } catch (error: any) {
      setResult({
        errors: error.graphQLErrors || [{ message: error.message }],
        loading: false,
      });
    }
  };

  const saveQuery = () => {
    if (!activeQuery) return;

    const updatedQueries = [...queries];
    const existingIndex = updatedQueries.findIndex(q => q.id === activeQuery.id);

    if (existingIndex >= 0) {
      updatedQueries[existingIndex] = activeQuery;
    } else {
      updatedQueries.push(activeQuery);
    }

    setQueries(updatedQueries);
    localStorage.setItem('graphql-playground-queries', JSON.stringify(updatedQueries));
  };

  const createNewQuery = () => {
    const newQuery: PlaygroundQuery = {
      id: Date.now().toString(),
      name: 'New Query',
      query: '# Write your GraphQL query here\nquery {\n  \n}',
      variables: '{}',
      headers: '{}',
    };
    setActiveQuery(newQuery);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-50 text-sm font-medium"
        title="Open GraphQL Playground"
      >
        🚀 GraphQL
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-11/12 h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">GraphQL Playground</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
            <div className="mb-4">
              <button
                onClick={createNewQuery}
                className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
              >
                New Query
              </button>
            </div>

            <div className="mb-4">
              <h3 className="font-medium text-sm text-gray-700 mb-2">Saved Queries</h3>
              {queries.map(query => (
                <button
                  key={query.id}
                  onClick={() => setActiveQuery(query)}
                  className={`w-full text-left px-2 py-1 rounded text-sm mb-1 ${
                    activeQuery?.id === query.id
                      ? 'bg-blue-100 text-blue-800'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {query.name}
                </button>
              ))}
            </div>

            {schema && (
              <div>
                <h3 className="font-medium text-sm text-gray-700 mb-2">Schema Types</h3>
                <div className="text-xs text-gray-600 max-h-40 overflow-y-auto">
                  {schema.types
                    .filter((type: any) => !type.name.startsWith('__'))
                    .slice(0, 10)
                    .map((type: any) => (
                      <div key={type.name} className="mb-1">
                        <span className="font-mono">{type.name}</span>
                        <span className="text-gray-400 ml-1">({type.kind})</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {activeQuery && (
              <>
                {/* Query Editor */}
                <div className="flex-1 flex">
                  <div className="flex-1 flex flex-col">
                    <div className="p-2 border-b">
                      <input
                        type="text"
                        value={activeQuery.name}
                        onChange={(e) => setActiveQuery({ ...activeQuery, name: e.target.value })}
                        className="font-medium text-sm border-none outline-none"
                      />
                    </div>
                    <textarea
                      value={activeQuery.query}
                      onChange={(e) => setActiveQuery({ ...activeQuery, query: e.target.value })}
                      className="flex-1 p-4 font-mono text-sm border-none outline-none resize-none"
                      placeholder="Write your GraphQL query here..."
                    />
                  </div>

                  <div className="w-80 border-l flex flex-col">
                    <div className="p-2 border-b text-sm font-medium">Variables</div>
                    <textarea
                      value={activeQuery.variables}
                      onChange={(e) => setActiveQuery({ ...activeQuery, variables: e.target.value })}
                      className="flex-1 p-2 font-mono text-xs border-none outline-none resize-none"
                      placeholder='{"key": "value"}'
                    />
                    <div className="p-2 border-b border-t text-sm font-medium">Headers</div>
                    <textarea
                      value={activeQuery.headers}
                      onChange={(e) => setActiveQuery({ ...activeQuery, headers: e.target.value })}
                      className="flex-1 p-2 font-mono text-xs border-none outline-none resize-none"
                      placeholder='{"Authorization": "Bearer token"}'
                    />
                  </div>
                </div>

                {/* Controls */}
                <div className="p-4 border-t flex items-center gap-2">
                  <button
                    onClick={executeQuery}
                    disabled={result.loading}
                    className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                  >
                    {result.loading ? 'Running...' : 'Run Query'}
                  </button>
                  <button
                    onClick={saveQuery}
                    className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600"
                  >
                    Save
                  </button>
                </div>

                {/* Results */}
                <div className="flex-1 border-t">
                  <div className="p-2 border-b text-sm font-medium">Results</div>
                  <div className="p-4 overflow-auto h-64">
                    <pre className="text-xs font-mono">
                      {JSON.stringify(result.data || result.errors || {}, null, 2)}
                    </pre>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for accessing playground functionality
export function useGraphQLPlayground() {
  const client = useApolloClient();

  const executeQuery = async (query: string, variables?: any, context?: any) => {
    try {
      const result = await client.query({
        query: gql(query),
        variables,
        context,
        fetchPolicy: 'network-only',
      });
      return { data: result.data, errors: null };
    } catch (error: any) {
      return { data: null, errors: error.graphQLErrors || [{ message: error.message }] };
    }
  };

  return { executeQuery };
}