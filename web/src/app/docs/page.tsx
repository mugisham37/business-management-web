/**
 * API Documentation Page
 * Development-mode API documentation page
 * Requirements: 10.5
 */

import React from 'react';
import { DocumentationViewer } from '@/components/docs/DocumentationViewer';

export default function DocsPage() {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Documentation Not Available
          </h1>
          <p className="text-gray-600">
            API documentation is only available in development mode.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <DocumentationViewer className="h-screen" />
    </div>
  );
}

export const metadata = {
  title: 'API Documentation',
  description: 'GraphQL API documentation and interactive explorer',
};