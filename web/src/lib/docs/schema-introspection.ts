/**
 * GraphQL Schema Introspection
 * Automatic schema introspection and documentation generation
 * Requirements: 10.5
 */

import { gql, ApolloClient } from '@apollo/client';

export interface SchemaType {
  name: string;
  kind: string;
  description?: string;
  fields?: SchemaField[];
  inputFields?: SchemaInputField[];
  interfaces?: SchemaType[];
  possibleTypes?: SchemaType[];
  enumValues?: SchemaEnumValue[];
}

export interface SchemaField {
  name: string;
  description?: string;
  type: SchemaTypeRef;
  args: SchemaInputField[];
  isDeprecated: boolean;
  deprecationReason?: string;
}

export interface SchemaInputField {
  name: string;
  description?: string;
  type: SchemaTypeRef;
  defaultValue?: string;
}

export interface SchemaTypeRef {
  kind: string;
  name?: string;
  ofType?: SchemaTypeRef;
}

export interface SchemaEnumValue {
  name: string;
  description?: string;
  isDeprecated: boolean;
  deprecationReason?: string;
}

export interface SchemaDirective {
  name: string;
  description?: string;
  locations: string[];
  args: SchemaInputField[];
}

export interface IntrospectionResult {
  types: SchemaType[];
  queryType?: SchemaType;
  mutationType?: SchemaType;
  subscriptionType?: SchemaType;
  directives: SchemaDirective[];
}

const INTROSPECTION_QUERY = gql`
  query IntrospectionQuery {
    __schema {
      queryType { name }
      mutationType { name }
      subscriptionType { name }
      types {
        ...FullType
      }
      directives {
        name
        description
        locations
        args {
          ...InputValue
        }
      }
    }
  }

  fragment FullType on __Type {
    kind
    name
    description
    fields(includeDeprecated: true) {
      name
      description
      args {
        ...InputValue
      }
      type {
        ...TypeRef
      }
      isDeprecated
      deprecationReason
    }
    inputFields {
      ...InputValue
    }
    interfaces {
      ...TypeRef
    }
    enumValues(includeDeprecated: true) {
      name
      description
      isDeprecated
      deprecationReason
    }
    possibleTypes {
      ...TypeRef
    }
  }

  fragment InputValue on __InputValue {
    name
    description
    type { ...TypeRef }
    defaultValue
  }

  fragment TypeRef on __Type {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

export class SchemaIntrospector {
  private client: ApolloClient<any>;
  private cachedSchema: IntrospectionResult | null = null;

  constructor(client: ApolloClient<any>) {
    this.client = client;
  }

  async introspectSchema(useCache = true): Promise<IntrospectionResult> {
    if (useCache && this.cachedSchema) {
      return this.cachedSchema;
    }

    try {
      const result = await this.client.query({
        query: INTROSPECTION_QUERY,
        fetchPolicy: 'network-only',
      });

      const schema = result.data.__schema;
      
      const introspectionResult: IntrospectionResult = {
        types: schema.types,
        queryType: schema.types.find((type: any) => type.name === schema.queryType?.name),
        mutationType: schema.types.find((type: any) => type.name === schema.mutationType?.name),
        subscriptionType: schema.types.find((type: any) => type.name === schema.subscriptionType?.name),
        directives: schema.directives,
      };

      this.cachedSchema = introspectionResult;
      return introspectionResult;
    } catch (error) {
      console.error('Failed to introspect GraphQL schema:', error);
      throw new Error('Schema introspection failed');
    }
  }

  async getTypeByName(typeName: string): Promise<SchemaType | null> {
    const schema = await this.introspectSchema();
    return schema.types.find(type => type.name === typeName) || null;
  }

  async getQueryFields(): Promise<SchemaField[]> {
    const schema = await this.introspectSchema();
    return schema.queryType?.fields || [];
  }

  async getMutationFields(): Promise<SchemaField[]> {
    const schema = await this.introspectSchema();
    return schema.mutationType?.fields || [];
  }

  async getSubscriptionFields(): Promise<SchemaField[]> {
    const schema = await this.introspectSchema();
    return schema.subscriptionType?.fields || [];
  }

  async getCustomTypes(): Promise<SchemaType[]> {
    const schema = await this.introspectSchema();
    
    // Filter out built-in GraphQL types
    const builtInTypes = ['String', 'Int', 'Float', 'Boolean', 'ID'];
    const systemTypes = schema.types.filter(type => 
      type.name.startsWith('__') || builtInTypes.includes(type.name)
    );
    
    return schema.types.filter(type => 
      !systemTypes.some(sysType => sysType.name === type.name)
    );
  }

  formatTypeRef(typeRef: SchemaTypeRef): string {
    if (typeRef.kind === 'NON_NULL') {
      return `${this.formatTypeRef(typeRef.ofType!)}!`;
    }
    
    if (typeRef.kind === 'LIST') {
      return `[${this.formatTypeRef(typeRef.ofType!)}]`;
    }
    
    return typeRef.name || 'Unknown';
  }

  clearCache(): void {
    this.cachedSchema = null;
  }
}