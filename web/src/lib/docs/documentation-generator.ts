/**
 * Documentation Generator
 * Generates comprehensive API documentation from GraphQL schema
 * Requirements: 10.5
 */

import { SchemaIntrospector, SchemaType, SchemaField, IntrospectionResult } from './schema-introspection';

export interface DocumentationSection {
  title: string;
  content: string;
  subsections?: DocumentationSection[];
}

export interface APIDocumentation {
  title: string;
  description: string;
  sections: DocumentationSection[];
  lastUpdated: Date;
}

export class DocumentationGenerator {
  private introspector: SchemaIntrospector;

  constructor(introspector: SchemaIntrospector) {
    this.introspector = introspector;
  }

  async generateFullDocumentation(): Promise<APIDocumentation> {
    const schema = await this.introspector.introspectSchema();
    
    const sections: DocumentationSection[] = [
      await this.generateOverviewSection(schema),
      await this.generateQueriesSection(),
      await this.generateMutationsSection(),
      await this.generateSubscriptionsSection(),
      await this.generateTypesSection(),
      await this.generateDirectivesSection(schema),
    ];

    return {
      title: 'GraphQL API Documentation',
      description: 'Comprehensive API documentation for the GraphQL endpoint',
      sections: sections.filter(section => section.content.length > 0),
      lastUpdated: new Date(),
    };
  }

  private async generateOverviewSection(schema: IntrospectionResult): Promise<DocumentationSection> {
    const customTypes = await this.introspector.getCustomTypes();
    const queryFields = await this.introspector.getQueryFields();
    const mutationFields = await this.introspector.getMutationFields();
    const subscriptionFields = await this.introspector.getSubscriptionFields();

    const content = `
# API Overview

This GraphQL API provides comprehensive access to the application's data and functionality.

## Statistics

- **Custom Types**: ${customTypes.length}
- **Query Operations**: ${queryFields.length}
- **Mutation Operations**: ${mutationFields.length}
- **Subscription Operations**: ${subscriptionFields.length}
- **Directives**: ${schema.directives.length}

## Getting Started

To use this API, send GraphQL queries to the endpoint using POST requests with the query in the request body.

### Example Query

\`\`\`graphql
query {
  # Your query here
}
\`\`\`

### Example Mutation

\`\`\`graphql
mutation {
  # Your mutation here
}
\`\`\`

### Example Subscription

\`\`\`graphql
subscription {
  # Your subscription here
}
\`\`\`
    `.trim();

    return {
      title: 'Overview',
      content,
    };
  }

  private async generateQueriesSection(): Promise<DocumentationSection> {
    const queryFields = await this.introspector.getQueryFields();
    
    if (queryFields.length === 0) {
      return {
        title: 'Queries',
        content: 'No query operations available.',
      };
    }

    const subsections = queryFields.map(field => ({
      title: field.name,
      content: this.generateFieldDocumentation(field, 'query'),
    }));

    return {
      title: 'Queries',
      content: `
# Query Operations

The following query operations are available:

${queryFields.map(field => `- **${field.name}**: ${field.description || 'No description available'}`).join('\n')}
      `.trim(),
      subsections,
    };
  }

  private async generateMutationsSection(): Promise<DocumentationSection> {
    const mutationFields = await this.introspector.getMutationFields();
    
    if (mutationFields.length === 0) {
      return {
        title: 'Mutations',
        content: 'No mutation operations available.',
      };
    }

    const subsections = mutationFields.map(field => ({
      title: field.name,
      content: this.generateFieldDocumentation(field, 'mutation'),
    }));

    return {
      title: 'Mutations',
      content: `
# Mutation Operations

The following mutation operations are available:

${mutationFields.map(field => `- **${field.name}**: ${field.description || 'No description available'}`).join('\n')}
      `.trim(),
      subsections,
    };
  }

  private async generateSubscriptionsSection(): Promise<DocumentationSection> {
    const subscriptionFields = await this.introspector.getSubscriptionFields();
    
    if (subscriptionFields.length === 0) {
      return {
        title: 'Subscriptions',
        content: 'No subscription operations available.',
      };
    }

    const subsections = subscriptionFields.map(field => ({
      title: field.name,
      content: this.generateFieldDocumentation(field, 'subscription'),
    }));

    return {
      title: 'Subscriptions',
      content: `
# Subscription Operations

The following subscription operations are available:

${subscriptionFields.map(field => `- **${field.name}**: ${field.description || 'No description available'}`).join('\n')}
      `.trim(),
      subsections,
    };
  }

  private async generateTypesSection(): Promise<DocumentationSection> {
    const customTypes = await this.introspector.getCustomTypes();
    
    if (customTypes.length === 0) {
      return {
        title: 'Types',
        content: 'No custom types available.',
      };
    }

    const subsections = customTypes.map(type => ({
      title: type.name,
      content: this.generateTypeDocumentation(type),
    }));

    return {
      title: 'Types',
      content: `
# Custom Types

The following custom types are defined in the schema:

${customTypes.map(type => `- **${type.name}** (${type.kind}): ${type.description || 'No description available'}`).join('\n')}
      `.trim(),
      subsections,
    };
  }

  private async generateDirectivesSection(schema: IntrospectionResult): Promise<DocumentationSection> {
    const customDirectives = schema.directives.filter(directive => 
      !['include', 'skip', 'deprecated'].includes(directive.name)
    );
    
    if (customDirectives.length === 0) {
      return {
        title: 'Directives',
        content: 'No custom directives available.',
      };
    }

    const content = `
# Custom Directives

The following custom directives are available:

${customDirectives.map(directive => `
## @${directive.name}

${directive.description || 'No description available'}

**Locations**: ${directive.locations.join(', ')}

${directive.args.length > 0 ? `
**Arguments**:
${directive.args.map(arg => `- **${arg.name}**: ${this.introspector.formatTypeRef(arg.type)} ${arg.description ? `- ${arg.description}` : ''}`).join('\n')}
` : ''}
`).join('\n')}
    `.trim();

    return {
      title: 'Directives',
      content,
    };
  }

  private generateFieldDocumentation(field: SchemaField, operationType: 'query' | 'mutation' | 'subscription'): string {
    const returnType = this.introspector.formatTypeRef(field.type);
    
    let content = `
## ${field.name}

${field.description || 'No description available'}

**Return Type**: \`${returnType}\`

${field.isDeprecated ? `
⚠️ **Deprecated**: ${field.deprecationReason || 'This field is deprecated'}
` : ''}

### Usage

\`\`\`graphql
${operationType} {
  ${field.name}${field.args.length > 0 ? `(${field.args.map(arg => `${arg.name}: ${this.getExampleValue(arg.type)}`).join(', ')})` : ''} {
    # Select fields from ${returnType}
  }
}
\`\`\`
    `;

    if (field.args.length > 0) {
      content += `
### Arguments

${field.args.map(arg => `
- **${arg.name}**: \`${this.introspector.formatTypeRef(arg.type)}\`${arg.description ? ` - ${arg.description}` : ''}${arg.defaultValue ? ` (default: \`${arg.defaultValue}\`)` : ''}
`).join('')}
      `;
    }

    return content.trim();
  }

  private generateTypeDocumentation(type: SchemaType): string {
    let content = `
## ${type.name}

${type.description || 'No description available'}

**Kind**: ${type.kind}
    `;

    if (type.fields && type.fields.length > 0) {
      content += `
### Fields

${type.fields.map(field => `
- **${field.name}**: \`${this.introspector.formatTypeRef(field.type)}\`${field.description ? ` - ${field.description}` : ''}${field.isDeprecated ? ' ⚠️ *Deprecated*' : ''}
`).join('')}
      `;
    }

    if (type.inputFields && type.inputFields.length > 0) {
      content += `
### Input Fields

${type.inputFields.map(field => `
- **${field.name}**: \`${this.introspector.formatTypeRef(field.type)}\`${field.description ? ` - ${field.description}` : ''}${field.defaultValue ? ` (default: \`${field.defaultValue}\`)` : ''}
`).join('')}
      `;
    }

    if (type.enumValues && type.enumValues.length > 0) {
      content += `
### Enum Values

${type.enumValues.map(value => `
- **${value.name}**${value.description ? ` - ${value.description}` : ''}${value.isDeprecated ? ' ⚠️ *Deprecated*' : ''}
`).join('')}
      `;
    }

    if (type.interfaces && type.interfaces.length > 0) {
      content += `
### Implements

${type.interfaces.map(iface => `- ${iface.name}`).join('\n')}
      `;
    }

    if (type.possibleTypes && type.possibleTypes.length > 0) {
      content += `
### Possible Types

${type.possibleTypes.map(pType => `- ${pType.name}`).join('\n')}
      `;
    }

    return content.trim();
  }

  private getExampleValue(typeRef: any): string {
    const typeName = this.introspector.formatTypeRef(typeRef);
    
    if (typeName.includes('String')) return '"example"';
    if (typeName.includes('Int')) return '123';
    if (typeName.includes('Float')) return '123.45';
    if (typeName.includes('Boolean')) return 'true';
    if (typeName.includes('ID')) return '"id-123"';
    
    return '...';
  }

  async generateMarkdown(): Promise<string> {
    const documentation = await this.generateFullDocumentation();
    
    let markdown = `# ${documentation.title}

${documentation.description}

*Last updated: ${documentation.lastUpdated.toISOString()}*

---

`;

    for (const section of documentation.sections) {
      markdown += `${section.content}\n\n`;
      
      if (section.subsections) {
        for (const subsection of section.subsections) {
          markdown += `${subsection.content}\n\n`;
        }
      }
    }

    return markdown;
  }

  async generateJSON(): Promise<string> {
    const documentation = await this.generateFullDocumentation();
    return JSON.stringify(documentation, null, 2);
  }
}