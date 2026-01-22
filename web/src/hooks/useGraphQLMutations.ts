import { useMutation, useApolloClient } from '@apollo/client';
import { updateCacheAfterMutation, optimisticUpdates } from '@/lib/apollo/cache-utils';
import { DocumentNode } from '@apollo/client';

/**
 * Enhanced mutation hook with automatic cache updates
 */
export function useEnhancedMutation(
  mutation: DocumentNode,
  options: {
    listQuery?: DocumentNode;
    listField?: string;
    optimisticResponse?: (variables: Record<string, unknown>) => Record<string, unknown>;
    onCacheUpdate?: (data: Record<string, unknown>, variables: Record<string, unknown>) => void;
  } = {}
) {
  const [mutate, result] = useMutation(mutation, {
    errorPolicy: 'all',
    onCompleted: (data, mutationResult) => {
      // Custom cache update logic
      if (options.onCacheUpdate && mutationResult?.variables) {
        options.onCacheUpdate(data, mutationResult.variables);
      }
    },
    onError: (error) => {
      // Handle optimistic update rollback
      optimisticUpdates.handleOptimisticError(error, 'mutation');
    },
    update: (cache, { data }, { variables }) => {
      if (!data || !options.listQuery || !options.listField || !variables) return;
      
      // Automatically update list cache
      const mutationName = Object.keys(data)[0];
      if (!mutationName) return;
      
      const mutationResult = (data as Record<string, unknown>)[mutationName];
      
      if (mutationResult && typeof mutationResult === 'object' && 'id' in mutationResult) {
        updateCacheAfterMutation.addToList(
          options.listQuery,
          options.listField,
          mutationResult as Record<string, string | number | boolean>,
          variables as Record<string, unknown>
        );
      }
    },
  });

  const mutateWithOptimistic = async (variables: Record<string, unknown>) => {
    const optimisticResponse = options.optimisticResponse?.(variables);
    
    return mutate({
      variables,
      ...(optimisticResponse && { optimisticResponse }),
    });
  };

  return [mutateWithOptimistic, result] as const;
}

/**
 * Hook for create mutations with automatic cache updates
 */
export function useCreateMutation(
  mutation: DocumentNode,
  listQuery: DocumentNode,
  listField: string,
  optimisticDataFactory?: (variables: Record<string, unknown>) => Record<string, unknown>
) {
  return useEnhancedMutation(mutation, {
    listQuery,
    listField,
    ...(optimisticDataFactory && {
      optimisticResponse: (variables) => {
        const optimisticData = optimisticDataFactory(variables);
        
        return optimisticUpdates.createOptimisticResponse(
          'createItem',
          { ...optimisticData, __typename: 'Unknown' }
        );
      }
    }),
  });
}

/**
 * Hook for update mutations with automatic cache updates
 */
export function useUpdateMutation(
  mutation: DocumentNode,
  listQuery?: DocumentNode,
  listField?: string
) {
  return useEnhancedMutation(mutation, {
    ...(listQuery && { listQuery }),
    ...(listField && { listField }),
    onCacheUpdate: (data, variables) => {
      if (!listQuery || !listField) return;
      
      const mutationName = Object.keys(data)[0];
      if (!mutationName) return;
      
      const mutationResult = data[mutationName];
      
      if (mutationResult && typeof mutationResult === 'object' && 'id' in mutationResult) {
        updateCacheAfterMutation.updateInList(
          listQuery,
          listField,
          mutationResult as Record<string, string | number | boolean>,
          variables
        );
      }
    },
  });
}

/**
 * Hook for delete mutations with automatic cache updates
 */
export function useDeleteMutation(
  mutation: DocumentNode,
  listQuery?: DocumentNode,
  listField?: string
) {
  return useMutation(mutation, {
    errorPolicy: 'all',
    update: (cache, { data }, { variables }) => {
      if (!data || !listQuery || !listField || !variables) return;
      
      const mutationName = Object.keys(data)[0];
      if (!mutationName) return;
      
      const mutationResult = (data as Record<string, unknown>)[mutationName];
      
      // Remove from list cache
      if (mutationResult && typeof mutationResult === 'object' && 'success' in mutationResult && 'id' in variables) {
        updateCacheAfterMutation.removeFromList(
          listQuery,
          listField,
          (variables as Record<string, unknown>).id as string,
          variables as Record<string, unknown>
        );
      }
      
      // Remove entity from cache
      if ('id' in variables) {
        cache.evict({ id: `${listField}:${(variables as Record<string, unknown>).id}` });
        cache.gc();
      }
    },
  });
}

/**
 * Hook for cache invalidation
 */
export function useCacheInvalidation() {
  const client = useApolloClient();
  
  return {
    invalidateQueries: (queryNames: string[]) => {
      queryNames.forEach(queryName => {
        client.cache.evict({ fieldName: queryName });
      });
      client.cache.gc();
    },
    
    invalidateEntity: (typeName: string, id: string) => {
      client.cache.evict({ id: `${typeName}:${id}` });
      client.cache.gc();
    },
    
    refetchQueries: (queries: DocumentNode[]) => {
      return client.refetchQueries({
        include: queries,
      });
    },
    
    clearCache: () => {
      return client.cache.reset();
    },
  };
}