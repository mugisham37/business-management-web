/**
 * Expect-CT Report API Route
 * Handles Certificate Transparency violation reports
 * Requirements: 12.1
 */

import { NextRequest, NextResponse } from 'next/server';
import { auditLogger } from '@/lib/security/audit-logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log the Expect-CT violation
    await auditLogger.logSecurityEvent(
      'expect_ct_violation',
      'failure',
      {
        hostname: body.hostname,
        port: body.port,
        effectiveExpiration: body['effective-expiration'],
        servedCertificateChain: body['served-certificate-chain']?.length || 0,
        validatedCertificateChain: body['validated-certificate-chain']?.length || 0,
        scts: body.scts?.length || 0
      },
      'high'
    );

    console.warn('Expect-CT violation reported:', {
      hostname: body.hostname,
      port: body.port,
      effectiveExpiration: body['effective-expiration']
    });

    return NextResponse.json({ status: 'received' });
  } catch (error) {
    console.error('Expect-CT report processing failed:', error);
    
    await auditLogger.logSecurityEvent(
      'expect_ct_report_processing_error',
      'failure',
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'low'
    );

    return NextResponse.json(
      { error: 'Failed to process Expect-CT report' },
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