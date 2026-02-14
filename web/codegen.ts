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
        scalars: {
          DateTime: 'string',
          JSON: 'Record<string, any>',
        },
      },
    },
  },
  hooks: {
    afterAllFileWrite: ['prettier --write'],
  },
};

export default config;
