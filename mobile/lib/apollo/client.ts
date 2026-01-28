/**
 * Apollo Client Configuration
 *
 * Sets up Apollo Client with:
 * - HTTP link pointing to GraphQL server
 * - Authentication link for JWT token injection
 * - Error handling with retry logic
 * - Cache persistence for offline support
 */
import {
    ApolloClient,
    InMemoryCache,
    createHttpLink,
    from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";
import Constants from "expo-constants";
import { secureStorage, appStorage, STORAGE_KEYS } from "../storage";

// Get GraphQL endpoint from config
const GRAPHQL_ENDPOINT =
    Constants.expoConfig?.extra?.graphqlEndpoint ||
    "http://localhost:4000/graphql";

/**
 * HTTP Link - Base connection to GraphQL server
 */
const httpLink = createHttpLink({
    uri: GRAPHQL_ENDPOINT,
    credentials: "include",
});

/**
 * Auth Link - Attaches JWT token to every request
 */
const authLink = setContext(async (_, { headers }) => {
    try {
        const tokens = await secureStorage.getTokens();
        const tenantId = appStorage.getString(STORAGE_KEYS.TENANT_ID);

        return {
            headers: {
                ...headers,
                authorization: tokens?.accessToken
                    ? `Bearer ${tokens.accessToken}`
                    : "",
                "x-tenant-id": tenantId || "",
            },
        };
    } catch (error) {
        console.error("Error getting auth context:", error);
        return { headers };
    }
});

/**
 * Error Link - Handles GraphQL and network errors
 */
const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path, extensions }) => {
            console.error(
                `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(
                    locations
                )}, Path: ${path}`
            );

            // Handle authentication errors
            if (
                extensions?.code === "UNAUTHENTICATED" ||
                message.includes("Unauthorized")
            ) {
                // Token expired - trigger refresh or logout
                handleAuthError();
            }
        });
    }

    if (networkError) {
        console.error(`[Network error]: ${networkError}`);

        // Handle offline scenarios
        if ((networkError as any).statusCode === 0) {
            console.log("Network offline - operations will be queued");
        }
    }
});

/**
 * Retry Link - Automatically retry failed requests
 */
const retryLink = new RetryLink({
    delay: {
        initial: 300,
        max: 5000,
        jitter: true,
    },
    attempts: {
        max: 3,
        retryIf: (error: any) => {
            // Retry on network errors, not on GraphQL errors
            return !!error;
        },
    },
});

/**
 * Handle authentication errors - clear tokens and redirect to login
 */
async function handleAuthError() {
    await secureStorage.clearTokens();
    appStorage.delete(STORAGE_KEYS.USER_ID);
    appStorage.delete(STORAGE_KEYS.TENANT_ID);
    // Navigation to login will be handled by auth state observer
}

/**
 * Cache Configuration with type policies
 */
const cache = new InMemoryCache({
    typePolicies: {
        Query: {
            fields: {
                // Pagination policies for lists
                products: {
                    keyArgs: ["where", "orderBy"],
                    merge(existing = { nodes: [] }, incoming) {
                        return {
                            ...incoming,
                            nodes: [...existing.nodes, ...incoming.nodes],
                        };
                    },
                },
                customers: {
                    keyArgs: ["where", "orderBy"],
                    merge(existing = { nodes: [] }, incoming) {
                        return {
                            ...incoming,
                            nodes: [...existing.nodes, ...incoming.nodes],
                        };
                    },
                },
                orders: {
                    keyArgs: ["where", "orderBy"],
                    merge(existing = { nodes: [] }, incoming) {
                        return {
                            ...incoming,
                            nodes: [...existing.nodes, ...incoming.nodes],
                        };
                    },
                },
                employees: {
                    keyArgs: ["where", "orderBy"],
                    merge(existing = { nodes: [] }, incoming) {
                        return {
                            ...incoming,
                            nodes: [...existing.nodes, ...incoming.nodes],
                        };
                    },
                },
            },
        },
        // Normalize entities by ID
        Product: {
            keyFields: ["id"],
        },
        Customer: {
            keyFields: ["id"],
        },
        Order: {
            keyFields: ["id"],
        },
        Employee: {
            keyFields: ["id"],
        },
        User: {
            keyFields: ["id"],
        },
        Tenant: {
            keyFields: ["id"],
        },
        Location: {
            keyFields: ["id"],
        },
        Inventory: {
            keyFields: ["id"],
        },
    },
});

/**
 * Create Apollo Client instance
 */
export const createApolloClient = () => {
    return new ApolloClient({
        link: from([authLink, errorLink, retryLink, httpLink]),
        cache,
        defaultOptions: {
            watchQuery: {
                fetchPolicy: "cache-and-network",
                errorPolicy: "all",
                notifyOnNetworkStatusChange: true,
            },
            query: {
                fetchPolicy: "cache-first",
                errorPolicy: "all",
            },
            mutate: {
                errorPolicy: "all",
            },
        },
    });
};

// Export singleton client
export const apolloClient = createApolloClient();

// Export for external use
export { GRAPHQL_ENDPOINT };
