import { GraphQLError } from 'graphql';

/**
 * Calculate the complexity of a GraphQL query
 * Complexity is calculated based on:
 * - Number of fields requested
 * - Depth of nested queries
 * - List fields (multiplied by estimated list size)
 */
export function calculateComplexity(requestContext: any): number {
  const { document, operationName } = requestContext;
  
  if (!document) {
    return 0;
  }

  let complexity = 0;
  const estimatedListSize = 10; // Assume lists return 10 items on average

  function calculateSelectionComplexity(
    selections: any[],
    depth: number = 1,
  ): number {
    let selectionComplexity = 0;

    for (const selection of selections) {
      if (selection.kind === 'Field') {
        // Base complexity for each field
        selectionComplexity += 1;

        // Add complexity for nested selections
        if (selection.selectionSet) {
          const nestedComplexity = calculateSelectionComplexity(
            selection.selectionSet.selections,
            depth + 1,
          );
          
          // If field name suggests it's a list, multiply by estimated size
          const fieldName = selection.name.value;
          const isList = fieldName.endsWith('s') || 
                        fieldName === 'users' || 
                        fieldName === 'branches' ||
                        fieldName === 'departments' ||
                        fieldName === 'permissions' ||
                        fieldName === 'auditLogs';
          
          if (isList) {
            selectionComplexity += nestedComplexity * estimatedListSize;
          } else {
            selectionComplexity += nestedComplexity;
          }
        }
      } else if (selection.kind === 'InlineFragment' || selection.kind === 'FragmentSpread') {
        if (selection.selectionSet) {
          selectionComplexity += calculateSelectionComplexity(
            selection.selectionSet.selections,
            depth,
          );
        }
      }
    }

    return selectionComplexity;
  }

  // Find the operation definition
  for (const definition of document.definitions) {
    if (definition.kind === 'OperationDefinition') {
      if (!operationName || definition.name?.value === operationName) {
        complexity += calculateSelectionComplexity(
          definition.selectionSet.selections,
        );
      }
    }
  }

  return complexity;
}
