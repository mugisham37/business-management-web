import { NextRequest, NextResponse } from 'next/server';

interface TokenExchangeRequest {
  provider: 'google' | 'facebook' | 'github';
  code: string;
  redirectUri: string;
}

interface TokenExchangeResponse {
  provider: string;
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

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

    let tokenResponse: any;
    let userProfile: any;

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
async function exchangeGoogleCode(code: string, redirectUri: string) {
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
async function getGoogleUserProfile(accessToken: string) {
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
async function exchangeFacebookCode(code: string, redirectUri: string) {
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
async function getFacebookUserProfile(accessToken: string) {
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
async function exchangeGithubCode(code: string, redirectUri: string) {
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
async function getGithubUserProfile(accessToken: string) {
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

  const user = await userResponse.json();
  const emails = emailResponse.ok ? await emailResponse.json() : [];
  
  // Find primary email
  const primaryEmail = emails.find((email: any) => email.primary)?.email || user.email;

  return {
    ...user,
    email: primaryEmail,
  };
}

/**
 * Normalize user data across different providers
 */
function normalizeUserData(provider: string, profile: any) {
  switch (provider) {
    case 'google':
      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        firstName: profile.given_name,
        lastName: profile.family_name,
        avatar: profile.picture,
      };

    case 'facebook':
      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        firstName: profile.first_name,
        lastName: profile.last_name,
        avatar: profile.picture?.data?.url,
      };

    case 'github':
      const nameParts = (profile.name || '').split(' ');
      return {
        id: profile.id.toString(),
        email: profile.email,
        name: profile.name || profile.login,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        avatar: profile.avatar_url,
      };

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}