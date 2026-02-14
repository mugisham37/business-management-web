import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: '../server/src/schema.graphql',
  documents: 'src/foundation/hooks/**/*.graphql',
  generates: {
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
        apolloReactCommonImportFrom: '@apollo/client/react',
        apolloReactHooksImportFrom: '@apollo/client/react',
        scalars: {
          DateTime: 'string',
          JSON: 'Record<string, any>',
        },
        // Add ts-nocheck to disable type checking for generated file
        addDocBlocks: false,
      },
    },
  },
  hooks: {
    afterOneFileWrite: [
      // Add ts-nocheck at the top of the generated file
      'bash -c "echo \'// @ts-nocheck\' | cat - src/foundation/types/generated/graphql.ts > temp && mv temp src/foundation/types/generated/graphql.ts"',
    ],
  },
};

export default config;
