import { NextRequest, NextResponse } from 'next/server';

interface TokenExchangeRequest {
  provider: 'google' | 'facebook' | 'github';
  code: string;
  redirectUri: string;
}

interface TokenExchangeResponse {
  provider: string;
  accessToken: string;
  refreshToken: string | undefined;
  user: {
    id: string;
    email: string;
    name: string;
    firstName: string | undefined;
    lastName: string | undefined;
    avatar: string | undefined;
  };
}

// OAuth token response interfaces
interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
}

interface GoogleUserProfile {
  id: string;
  email: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

interface FacebookUserProfile {
  id: string;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  picture?: {
    data?: {
      url?: string;
    };
  };
}

interface GitHubUserProfile {
  id: number;
  email: string;
  name?: string;
  login: string;
  avatar_url?: string;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

type UserProfile = GoogleUserProfile | FacebookUserProfile | GitHubUserProfile;

/**
 * Exchange OAuth authorization code for access tokens
 */
export async function POST(request: NextRequest) {
  try {
    const body: TokenExchangeRequest = await request.json();
    const { provider, code, redirectUri } = body;

    if (!provider || !code || !redirectUri) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    let tokenResponse: OAuthTokenResponse;
    let userProfile: UserProfile;

    switch (provider) {
      case 'google':
        tokenResponse = await exchangeGoogleCode(code, redirectUri);
        userProfile = await getGoogleUserProfile(tokenResponse.access_token);
        break;

      case 'facebook':
        tokenResponse = await exchangeFacebookCode(code, redirectUri);
        userProfile = await getFacebookUserProfile(tokenResponse.access_token);
        break;

      case 'github':
        tokenResponse = await exchangeGithubCode(code, redirectUri);
        userProfile = await getGithubUserProfile(tokenResponse.access_token);
        break;

      default:
        return NextResponse.json(
          { error: `Unsupported provider: ${provider}` },
          { status: 400 }
        );
    }

    // Normalize user data across providers
    const normalizedUser = normalizeUserData(provider, userProfile);

    // TODO: Create or update user in your database
    // TODO: Generate JWT tokens for your application
    // For now, we'll return the social auth data

    const response: TokenExchangeResponse = {
      provider,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      user: normalizedUser,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json(
      { error: 'Token exchange failed' },
      { status: 500 }
    );
  }
}

/**
 * Exchange Google authorization code for tokens
 */
async function exchangeGoogleCode(code: string, redirectUri: string): Promise<OAuthTokenResponse> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange Google code for tokens');
  }

  return await response.json();
}

/**
 * Get Google user profile
 */
async function getGoogleUserProfile(accessToken: string): Promise<GoogleUserProfile> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get Google user profile');
  }

  return await response.json();
}

/**
 * Exchange Facebook authorization code for tokens
 */
async function exchangeFacebookCode(code: string, redirectUri: string): Promise<OAuthTokenResponse> {
  const response = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID!,
      client_secret: process.env.FACEBOOK_APP_SECRET!,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange Facebook code for tokens');
  }

  return await response.json();
}

/**
 * Get Facebook user profile
 */
async function getFacebookUserProfile(accessToken: string): Promise<FacebookUserProfile> {
  const response = await fetch(
    'https://graph.facebook.com/me?fields=id,name,email,first_name,last_name,picture',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get Facebook user profile');
  }

  return await response.json();
}

/**
 * Exchange GitHub authorization code for tokens
 */
async function exchangeGithubCode(code: string, redirectUri: string): Promise<OAuthTokenResponse> {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID!,
      client_secret: process.env.GITHUB_CLIENT_SECRET!,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange GitHub code for tokens');
  }

  return await response.json();
}

/**
 * Get GitHub user profile
 */
async function getGithubUserProfile(accessToken: string): Promise<GitHubUserProfile> {
  const [userResponse, emailResponse] = await Promise.all([
    fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'BizManager-App',
      },
    }),
    fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'BizManager-App',
      },
    }),
  ]);

  if (!userResponse.ok) {
    throw new Error('Failed to get GitHub user profile');
  }

  const user: GitHubUserProfile = await userResponse.json();
  const emails: GitHubEmail[] = emailResponse.ok ? await emailResponse.json() : [];
  
  // Find primary email
  const primaryEmail = emails.find((email: GitHubEmail) => email.primary)?.email || user.email;

  return {
    ...user,
    email: primaryEmail,
  };
}

interface NormalizedUser {
  id: string;
  email: string;
  name: string;
  firstName: string | undefined;
  lastName: string | undefined;
  avatar: string | undefined;
}

/**
 * Normalize user data across different providers
 */
function normalizeUserData(provider: string, profile: UserProfile): NormalizedUser {
  switch (provider) {
    case 'google': {
      const googleProfile = profile as GoogleUserProfile;
      return {
        id: googleProfile.id,
        email: googleProfile.email,
        name: googleProfile.name,
        firstName: googleProfile.given_name,
        lastName: googleProfile.family_name,
        avatar: googleProfile.picture,
      };
    }

    case 'facebook': {
      const fbProfile = profile as FacebookUserProfile;
      return {
        id: fbProfile.id,
        email: fbProfile.email,
        name: fbProfile.name,
        firstName: fbProfile.first_name,
        lastName: fbProfile.last_name,
        avatar: fbProfile.picture?.data?.url,
      };
    }

    case 'github': {
      const ghProfile = profile as GitHubUserProfile;
      const nameParts = (ghProfile.name || '').split(' ');
      return {
        id: ghProfile.id.toString(),
        email: ghProfile.email,
        name: ghProfile.name || ghProfile.login,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        avatar: ghProfile.avatar_url,
      };
    }

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}