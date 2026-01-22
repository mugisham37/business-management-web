/**
 * CSP Violation Report API Route
 * Handles Content Security Policy violation reports
 * Requirements: 12.1
 */

import { NextRequest, NextResponse } from 'next/server';
import { cspReportHandler } from '@/lib/security/content-security-policy';
import { auditLogger } from '@/lib/security/audit-logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const report = body['csp-report'];

    if (!report) {
      return NextResponse.json(
        { error: 'Invalid CSP report format' },
        { status: 400 }
      );
    }

    // Handle the CSP violation report
    cspReportHandler.handleReport(report);

    // Log the violation for audit purposes
    await auditLogger.logSecurityEvent(
      'csp_violation',
      'failure',
      {
        violatedDirective: report['violated-directive'],
        blockedUri: report['blocked-uri'],
        documentUri: report['document-uri'],
        sourceFile: report['source-file'],
        lineNumber: report['line-number'],
        columnNumber: report['column-number']
      },
      'medium'
    );

    return NextResponse.json({ status: 'received' });
  } catch (error) {
    console.error('CSP report processing failed:', error);
    
    await auditLogger.logSecurityEvent(
      'csp_report_processing_error',
      'failure',
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'low'
    );

    return NextResponse.json(
      { error: 'Failed to process CSP report' },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}