import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: '../server/src/schema.graphql',
  documents: 'src/foundation/hooks/**/*.graphql',
  generates: {
    // Types only (can be imported in server components)
    'src/foundation/types/generated/graphql-types.ts': {
      plugins: ['typescript', 'typescript-operations'],
      config: {
        skipTypename: false,
        avoidOptionals: false,
        maybeValue: 'T | null',
        scalars: {
          DateTime: 'string',
          JSON: 'Record<string, any>',
        },
        addDocBlocks: false,
      },
    },
    // Hooks (client-only)
    'src/foundation/types/generated/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
      config: {
        withHooks: true,
        withComponent: false,
        withHOC: false,
        skipTypename: false,
        avoidOptionals: false,
        maybeValue: 'T | null',
        apolloReactCommonImportFrom: '@apollo/client',
        apolloReactHooksImportFrom: '@apollo/client/react',
        scalars: {
          DateTime: 'string',
          JSON: 'Record<string, any>',
        },
        addDocBlocks: false,
        addInfiniteQueryField: false,
        addSuspenseQuery: false,
      },
    },
  },
};

export default config;
