import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/auth/validate-reset-token?token=xxx
 * 
 * Query params:
 * - token: string (the reset token from email)
 * 
 * Response:
 * {
 *   valid: boolean;
 *   message?: string;
 * }
 * 
 * Implementation steps:
 * 1. Extract token from query params
 * 2. Look up token in database
 * 3. Check if token exists and hasn't expired
 * 4. Check if token hasn't been used already
 * 5. Return validation result
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    // Validate input
    if (!token) {
      return NextResponse.json(
        { valid: false, message: "Token is required" },
        { status: 400 }
      );
    }

    // TODO: Implement the following:
    // 1. Query database for token
    // 2. Check if token exists
    // 3. Check if token hasn't expired (created_at + 15 minutes > now)
    // 4. Check if token hasn't been used (used_at is null)
    // 5. Return validation result

    // For now, return valid if token is longer than 10 characters (mock)
    const isValid = token.length > 10;

    return NextResponse.json({
      valid: isValid,
      message: isValid ? "Token is valid" : "Token is invalid or expired",
    });
  } catch (error) {
    console.error("Validate token error:", error);
    return NextResponse.json(
      { valid: false, message: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
