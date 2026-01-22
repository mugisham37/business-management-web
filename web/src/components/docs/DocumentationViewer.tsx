/**
 * Documentation Viewer Component
 * Interactive documentation viewer with live examples
 * Requirements: 10.5
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useApolloClient } from '@apollo/client';
import { SchemaIntrospector } from '@/lib/docs/schema-introspection';
import { DocumentationGenerator, APIDocumentation, DocumentationSection } from '@/lib/docs/documentation-generator';

interface DocumentationViewerProps {
  className?: string;
}

export function DocumentationViewer({ className = '' }: DocumentationViewerProps) {
  const client = useApolloClient();
  const [documentation, setDocumentation] = useState<APIDocumentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDocumentation();
  }, [client]);

  const loadDocumentation = async () => {
    try {
      setLoading(true);
      setError(null);

      const introspector = new SchemaIntrospector(client);
      const generator = new DocumentationGenerator(introspector);
      const docs = await generator.generateFullDocumentation();
      
      setDocumentation(docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documentation');
    } finally {
      setLoading(false);
    }
  };

  const filteredSections = documentation?.sections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.subsections?.some(sub =>
      sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || [];

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering for basic formatting
    return content
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded overflow-x-auto"><code class="text-sm font-mono">$2</code></pre>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/\n/g, '<br>');
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-8 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium mb-2">Error Loading Documentation</h3>
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={loadDocumentation}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!documentation) {
    return (
      <div className={`p-8 text-center text-gray-500 ${className}`}>
        No documentation available
      </div>
    );
  }

  return (
    <div className={`flex h-full ${className}`}>
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r overflow-y-auto">
        <div className="p-4">
          <h2 className="font-semibold text-lg mb-4">API Documentation</h2>
          
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveSection('overview')}
              className={`w-full text-left px-3 py-2 rounded text-sm ${
                activeSection === 'overview'
                  ? 'bg-blue-100 text-blue-800'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Overview
            </button>
            
            {filteredSections.map((section) => (
              <div key={section.title}>
                <button
                  onClick={() => setActiveSection(section.title.toLowerCase())}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    activeSection === section.title.toLowerCase()
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {section.title}
                </button>
                
                {section.subsections && activeSection === section.title.toLowerCase() && (
                  <div className="ml-4 mt-1 space-y-1">
                    {section.subsections.map((subsection) => (
                      <button
                        key={subsection.title}
                        onClick={() => setActiveSection(`${section.title.toLowerCase()}-${subsection.title.toLowerCase()}`)}
                        className="w-full text-left px-2 py-1 rounded text-xs text-gray-600 hover:bg-gray-100"
                      >
                        {subsection.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {documentation.title}
            </h1>
            <p className="text-gray-600 mb-4">{documentation.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Last updated: {documentation.lastUpdated.toLocaleDateString()}</span>
              <button
                onClick={loadDocumentation}
                className="text-blue-600 hover:text-blue-800"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="prose max-w-none">
            {activeSection === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">API Overview</h2>
                <p className="mb-4">
                  This documentation provides comprehensive information about the GraphQL API,
                  including available operations, types, and usage examples.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {filteredSections.map((section) => (
                    <div
                      key={section.title}
                      className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setActiveSection(section.title.toLowerCase())}
                    >
                      <h3 className="font-semibold mb-2">{section.title}</h3>
                      <p className="text-sm text-gray-600">
                        {section.subsections?.length || 0} items
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredSections.map((section) => {
              if (activeSection === section.title.toLowerCase()) {
                return (
                  <div key={section.title}>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(section.content)
                      }}
                    />
                    
                    {section.subsections && (
                      <div className="mt-8 space-y-8">
                        {section.subsections.map((subsection) => (
                          <div
                            key={subsection.title}
                            id={`${section.title.toLowerCase()}-${subsection.title.toLowerCase()}`}
                          >
                            <div
                              dangerouslySetInnerHTML={{
                                __html: renderMarkdown(subsection.content)
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // Check for subsection matches
              const subsectionMatch = section.subsections?.find(sub =>
                activeSection === `${section.title.toLowerCase()}-${sub.title.toLowerCase()}`
              );

              if (subsectionMatch) {
                return (
                  <div key={`${section.title}-${subsectionMatch.title}`}>
                    <nav className="mb-4 text-sm">
                      <button
                        onClick={() => setActiveSection(section.title.toLowerCase())}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {section.title}
                      </button>
                      <span className="mx-2 text-gray-400">/</span>
                      <span className="text-gray-600">{subsectionMatch.title}</span>
                    </nav>
                    
                    <div
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(subsectionMatch.content)
                      }}
                    />
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}