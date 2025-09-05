import type {
  Account,
  CreateAccountInput,
  UpdateAccountInput,
} from '../../domain/entities/account';
import type { User } from '../../domain/entities/user';

// OAuth account repository interface
export interface IOAuthAccountRepository {
  // Basic CRUD operations
  create(accountData: CreateAccountInput): Promise<Account>;
  findById(id: string): Promise<Account | null>;
  findByProvider(userId: string, provider: string): Promise<Account | null>;
  findByProviderAccountId(provider: string, providerAccountId: string): Promise<Account | null>;
  update(id: string, accountData: UpdateAccountInput): Promise<Account>;
  delete(id: string): Promise<void>;

  // User account management
  findByUserId(userId: string): Promise<Account[]>;
  unlinkAccount(userId: string, provider: string): Promise<void>;

  // Token management
  updateTokens(
    id: string,
    tokens: {
      accessToken?: string;
      refreshToken?: string;
      expiresAt?: Date;
      idToken?: string;
    }
  ): Promise<void>;

  // Provider queries
  findByProviders(providers: string[]): Promise<Account[]>;
  getActiveAccounts(userId: string): Promise<Account[]>;

  // Statistics
  count(options?: CountAccountOptions): Promise<number>;
  getAccountsByProvider(): Promise<Record<string, number>>;
}

// OAuth authorization code repository interface
export interface IOAuthAuthorizationCodeRepository {
  // Code management
  store(code: string, data: AuthorizationCodeData, expiresIn: number): Promise<void>;
  retrieve(code: string): Promise<AuthorizationCodeData | null>;
  revoke(code: string): Promise<void>;

  // Cleanup
  cleanup(): Promise<void>;

  // Validation
  isValid(code: string): Promise<boolean>;
}

// OAuth state repository interface
export interface IOAuthStateRepository {
  // State management
  store(state: string, data: StateData, expiresIn: number): Promise<void>;
  retrieve(state: string): Promise<StateData | null>;
  revoke(state: string): Promise<void>;

  // Cleanup
  cleanup(): Promise<void>;

  // Validation
  isValid(state: string): Promise<boolean>;
}

// OAuth user repository interface
export interface IOAuthUserRepository {
  // User creation and linking
  createFromOAuth(userData: OAuthUserData): Promise<User>;
  linkAccount(userId: string, accountData: CreateAccountInput): Promise<Account>;
  findOrCreateUser(
    oauthData: OAuthUserData
  ): Promise<{ user: User; account: Account; isNew: boolean }>;

  // Profile synchronization
  syncProfile(userId: string, providerData: any): Promise<User>;

  // Account management
  getLinkedAccounts(userId: string): Promise<Account[]>;
  hasProvider(userId: string, provider: string): Promise<boolean>;
}

// Supporting types
export interface AuthorizationCodeData {
  clientId: string;
  userId: string;
  redirectUri: string;
  scope: string[];
  codeChallenge?: string;
  codeChallengeMethod?: string;
  state?: string;
  nonce?: string;
}

export interface StateData {
  clientId: string;
  redirectUri: string;
  scope: string[];
  nonce?: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
}

export interface OAuthUserData {
  provider: string;
  providerAccountId: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  emailVerified?: boolean;
  providerData?: any;
}

export interface CountAccountOptions {
  where?: AccountWhereInput;
}

export interface AccountWhereInput {
  id?: string | string[];
  userId?: string | string[];
  provider?: string | string[];
  type?: string | string[];
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: DateFilter;
  updatedAt?: DateFilter;
}

export interface DateFilter {
  equals?: Date;
  in?: Date[];
  notIn?: Date[];
  lt?: Date;
  lte?: Date;
  gt?: Date;
  gte?: Date;
}
