/**
 * Type declarations for packages that may not have types installed
 * These provide type safety until packages are properly installed
 */

// CSS/Style imports
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

// React Native QRCode SVG
declare module 'react-native-qrcode-svg' {
  import { Component } from 'react';
  import { ViewStyle } from 'react-native';

  export interface QRCodeProps {
    value: string;
    size?: number;
    color?: string;
    backgroundColor?: string;
    logo?: { uri: string } | number;
    logoSize?: number;
    logoBackgroundColor?: string;
    logoMargin?: number;
    logoBorderRadius?: number;
    quietZone?: number;
    enableLinearGradient?: boolean;
    gradientDirection?: string[];
    linearGradient?: string[];
    ecl?: 'L' | 'M' | 'Q' | 'H';
    getRef?: (ref: any) => void;
    onError?: (error: Error) => void;
  }

  export default class QRCode extends Component<QRCodeProps> {}
}

// React Native MMKV
declare module 'react-native-mmkv' {
    export interface MMKVConfiguration {
        id?: string;
        path?: string;
        encryptionKey?: string;
    }

    export class MMKV {
        constructor(configuration?: MMKVConfiguration);
        set(key: string, value: string | number | boolean): void;
        getString(key: string): string | undefined;
        getNumber(key: string): number | undefined;
        getBoolean(key: string): boolean | undefined;
        delete(key: string): void;
        getAllKeys(): string[];
        contains(key: string): boolean;
        clearAll(): void;
    }
}

// React Native Keychain
declare module 'react-native-keychain' {
    export interface SetOptions {
        service?: string;
        accessible?: string;
        accessControl?: string;
        authenticationType?: string;
        accessGroup?: string;
    }

    export interface GetOptions {
        service?: string;
        authenticationPrompt?: {
            title?: string;
            description?: string;
            cancel?: string;
        };
    }

    export interface Credentials {
        username: string;
        password: string;
        service: string;
    }

    export const ACCESSIBLE: {
        WHEN_UNLOCKED: string;
        AFTER_FIRST_UNLOCK: string;
        ALWAYS: string;
        WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: string;
        WHEN_UNLOCKED_THIS_DEVICE_ONLY: string;
        AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: string;
    };

    export const ACCESS_CONTROL: {
        USER_PRESENCE: string;
        BIOMETRY_ANY: string;
        BIOMETRY_CURRENT_SET: string;
        DEVICE_PASSCODE: string;
        APPLICATION_PASSWORD: string;
        BIOMETRY_ANY_OR_DEVICE_PASSCODE: string;
        BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE: string;
    };

    export const BIOMETRY_TYPE: {
        TOUCH_ID: string;
        FACE_ID: string;
        FINGERPRINT: string;
        IRIS: string;
    };

    export function setGenericPassword(
        username: string,
        password: string,
        options?: SetOptions
    ): Promise<boolean | { service: string; storage: string }>;

    export function getGenericPassword(
        options?: GetOptions
    ): Promise<false | Credentials>;

    export function resetGenericPassword(options?: { service?: string }): Promise<boolean>;

    export function getSupportedBiometryType(): Promise<string | null>;

    export function canImplyAuthentication(options?: { authenticationType?: string }): Promise<boolean>;
}

// Expo Auth Session (supplemental types)
declare module 'expo-auth-session' {
    export interface AuthRequestConfig {
        clientId: string;
        scopes?: string[];
        redirectUri?: string;
        responseType?: ResponseType;
        prompt?: string;
        extraParams?: Record<string, string>;
        additionalParameters?: Record<string, string>;
    }

    export interface DiscoveryDocument {
        authorizationEndpoint?: string;
        tokenEndpoint?: string;
        revocationEndpoint?: string;
        userInfoEndpoint?: string;
        endSessionEndpoint?: string;
    }

    export interface AuthRequest {
        promptAsync(options?: { authorizationEndpoint?: string }): Promise<AuthSessionResult>;
    }

    export class AuthRequest {
        constructor(config: AuthRequestConfig);
    }

    export type AuthSessionResult = 
        | { type: 'success'; params: Record<string, string> }
        | { type: 'cancel' }
        | { type: 'error'; error: Error }
        | { type: 'dismiss' };

    export enum ResponseType {
        Code = 'code',
        Token = 'token',
    }

    export function makeRedirectUri(options?: {
        scheme?: string;
        path?: string;
        native?: string;
        preferLocalhost?: boolean;
    }): string;

    export function maybeCompleteAuthSession(): { type: 'success' | 'failed' };
}

// Apollo Client (supplemental for generic types when not properly resolved)
declare module '@apollo/client' {
    import { DocumentNode } from 'graphql';
    import { ReactNode } from 'react';

    export interface NormalizedCacheObject {
        [key: string]: any;
    }

    export class ApolloClient<TCacheShape = NormalizedCacheObject> {
        constructor(options: any);
        query<TData = any, TVariables = any>(options: any): Promise<{ data: TData | undefined }>;
        mutate<TData = any, TVariables = any>(options: any): Promise<{ data: TData | undefined | null }>;
        subscribe<TData = any, TVariables = any>(options: any): { 
            subscribe(observer: { 
                next?: (value: { data?: TData }) => void; 
                error?: (error: Error) => void;
                complete?: () => void;
            }): { unsubscribe: () => void }
        };
        watchQuery<TData = any, TVariables = any>(options: any): any;
        readQuery<TData = any>(options: any): TData | null;
        writeQuery<TData = any>(options: any): void;
        resetStore(): Promise<any>;
        clearStore(): Promise<any>;
        stop(): void;
        reFetchObservableQueries(includeStandby?: boolean): Promise<any>;
    }

    export class InMemoryCache {
        constructor(options?: any);
    }

    export function gql(literals: TemplateStringsArray, ...placeholders: any[]): DocumentNode;

    export function createHttpLink(options: any): any;
    export function from(links: any[]): any;

    // React Components
    export interface ApolloProviderProps<TCache = NormalizedCacheObject> {
        client: ApolloClient<TCache>;
        children?: ReactNode;
    }

    export function ApolloProvider<TCache = NormalizedCacheObject>(
        props: ApolloProviderProps<TCache>
    ): JSX.Element;

    export function useMutation<TData = any, TVariables = any>(
        mutation: DocumentNode,
        options?: any
    ): [
        (options?: any) => Promise<{ data?: TData | null }>,
        { data?: TData | null; loading: boolean; error?: any; called: boolean }
    ];

    export function useQuery<TData = any, TVariables = any>(
        query: DocumentNode,
        options?: any
    ): { data?: TData; loading: boolean; error?: any; refetch: (variables?: TVariables) => Promise<any> };

    export function useLazyQuery<TData = any, TVariables = any>(
        query: DocumentNode,
        options?: any
    ): [
        (options?: any) => Promise<{ data?: TData }>,
        { data?: TData; loading: boolean; error?: any; called: boolean }
    ];

    export function useSubscription<TData = any, TVariables = any>(
        subscription: DocumentNode,
        options?: any
    ): { data?: TData; loading: boolean; error?: any };

    export function useApolloClient(): ApolloClient<NormalizedCacheObject>;

    export interface ApolloError extends Error {
        graphQLErrors: readonly any[];
        networkError: Error | null;
        message: string;
        extraInfo?: any;
    }
}

// Apollo Error Link
declare module '@apollo/client/link/error' {
    export interface ErrorResponse {
        graphQLErrors?: ReadonlyArray<any>;
        networkError?: Error;
        response?: any;
        operation?: any;
        forward?: any;
    }

    export function onError(
        errorHandler: (errorResponse: ErrorResponse) => void
    ): any;
}

// Apollo Context Link
declare module '@apollo/client/link/context' {
    export function setContext(
        setter: (request: any, previousContext: any) => any | Promise<any>
    ): any;
}

// Apollo Retry Link
declare module '@apollo/client/link/retry' {
    export interface RetryLinkOptions {
        delay?: {
            initial?: number;
            max?: number;
            jitter?: boolean;
        };
        attempts?: {
            max?: number;
            retryIf?: (error: any, operation?: any) => boolean;
        };
    }

    export class RetryLink {
        constructor(options?: RetryLinkOptions);
    }
}
