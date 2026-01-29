'use client';

import { useCallback, useMemo } from 'react';
import { useQuery, ApolloError } from '@apollo/client';
import {
    GET_MY_MODULE_ACCESS,
    CAN_ACCESS_MODULE,
    GET_MY_ACCESSIBLE_MODULES,
    GET_MY_LOCKED_MODULES,
    GET_MODULES_BY_CATEGORY,
} from '@/lib/graphql/queries/tier-access';

/**
 * Business tier enum
 */
export enum BusinessTier {
    MICRO = 'micro',
    SMALL = 'small',
    MEDIUM = 'medium',
    ENTERPRISE = 'enterprise',
}

/**
 * Module category
 */
export type ModuleCategory = 'core' | 'growth' | 'business' | 'enterprise';

/**
 * Module access information
 */
export interface ModuleAccess {
    moduleName: string;
    displayName: string;
    isAccessible: boolean;
    requiredTier: BusinessTier;
    upgradePrompt: string | null;
    category: string;
    description: string | null;
}

/**
 * Tier display information
 */
const TIER_DISPLAY_INFO = {
    [BusinessTier.MICRO]: {
        name: 'Free',
        displayName: 'Free Plan',
        color: 'gray',
    },
    [BusinessTier.SMALL]: {
        name: 'Growth',
        displayName: 'Growth Plan',
        color: 'blue',
    },
    [BusinessTier.MEDIUM]: {
        name: 'Business',
        displayName: 'Business Plan',
        color: 'purple',
    },
    [BusinessTier.ENTERPRISE]: {
        name: 'Industry',
        displayName: 'Industry Plan',
        color: 'gold',
    },
};

/**
 * Get tier hierarchy level
 */
function getTierLevel(tier: BusinessTier): number {
    switch (tier) {
        case BusinessTier.MICRO:
            return 0;
        case BusinessTier.SMALL:
            return 1;
        case BusinessTier.MEDIUM:
            return 2;
        case BusinessTier.ENTERPRISE:
            return 3;
        default:
            return 0;
    }
}

/**
 * Hook for tier-based module access
 */
export function useTierAccess() {
    // Query all modules with access status
    const {
        data: modulesData,
        loading: modulesLoading,
        error: modulesError,
        refetch: refetchModules,
    } = useQuery(GET_MY_MODULE_ACCESS);

    // All modules with access info
    const modules: ModuleAccess[] = useMemo(() => {
        if (!modulesData?.myModuleAccess) return [];
        return modulesData.myModuleAccess;
    }, [modulesData]);

    // Accessible modules only
    const accessibleModules = useMemo(() => {
        return modules.filter((m) => m.isAccessible);
    }, [modules]);

    // Locked modules
    const lockedModules = useMemo(() => {
        return modules.filter((m) => !m.isAccessible);
    }, [modules]);

    // Group modules by category
    const modulesByCategory = useMemo(() => {
        const grouped: Record<string, ModuleAccess[]> = {};
        modules.forEach((module) => {
            if (!grouped[module.category]) {
                grouped[module.category] = [];
            }
            grouped[module.category].push(module);
        });
        return grouped;
    }, [modules]);

    // Check if a specific module is accessible
    const canAccess = useCallback(
        (moduleName: string): boolean => {
            const module = modules.find((m) => m.moduleName === moduleName);
            return module?.isAccessible ?? false;
        },
        [modules]
    );

    // Get module by name
    const getModule = useCallback(
        (moduleName: string): ModuleAccess | null => {
            return modules.find((m) => m.moduleName === moduleName) ?? null;
        },
        [modules]
    );

    // Get upgrade prompt for a module
    const getUpgradePrompt = useCallback(
        (moduleName: string): string | null => {
            const module = modules.find((m) => m.moduleName === moduleName);
            return module?.upgradePrompt ?? null;
        },
        [modules]
    );

    // Get required tier for a module
    const getRequiredTier = useCallback(
        (moduleName: string): BusinessTier | null => {
            const module = modules.find((m) => m.moduleName === moduleName);
            return module?.requiredTier ?? null;
        },
        [modules]
    );

    // Get modules for a specific category
    const getModulesByCategory = useCallback(
        (category: ModuleCategory): ModuleAccess[] => {
            return modulesByCategory[category] ?? [];
        },
        [modulesByCategory]
    );

    // Get tier display info
    const getTierInfo = useCallback((tier: BusinessTier) => {
        return TIER_DISPLAY_INFO[tier];
    }, []);

    // Compare two tiers
    const compareTiers = useCallback((tier1: BusinessTier, tier2: BusinessTier): number => {
        return getTierLevel(tier1) - getTierLevel(tier2);
    }, []);

    // Check if tier meets requirement
    const tierMeetsRequirement = useCallback(
        (userTier: BusinessTier, requiredTier: BusinessTier): boolean => {
            return getTierLevel(userTier) >= getTierLevel(requiredTier);
        },
        []
    );

    return {
        // Module data
        modules,
        accessibleModules,
        lockedModules,
        modulesByCategory,

        // Loading state
        isLoading: modulesLoading,
        error: modulesError as ApolloError | undefined,

        // Module access utilities
        canAccess,
        getModule,
        getUpgradePrompt,
        getRequiredTier,
        getModulesByCategory,

        // Tier utilities
        getTierInfo,
        compareTiers,
        tierMeetsRequirement,
        getTierLevel,

        // Refresh
        refetch: refetchModules,
    };
}

/**
 * Hook for checking access to a specific module
 */
export function useModuleAccess(moduleName: string) {
    const { canAccess, getModule, getUpgradePrompt, isLoading, error } = useTierAccess();

    return {
        isAccessible: canAccess(moduleName),
        module: getModule(moduleName),
        upgradePrompt: getUpgradePrompt(moduleName),
        isLoading,
        error,
    };
}

/**
 * Hook for filtering sidebar items by tier
 */
export function useSidebarModules() {
    const { modules, isLoading, error } = useTierAccess();

    // Get sidebar-ready modules organized by category
    const sidebarItems = useMemo(() => {
        const categories = ['core', 'growth', 'business', 'enterprise'];
        return categories.map((category) => ({
            category,
            displayName: category.charAt(0).toUpperCase() + category.slice(1),
            modules: modules.filter((m) => m.category === category),
        }));
    }, [modules]);

    // Get only accessible sidebar items
    const accessibleSidebarItems = useMemo(() => {
        return sidebarItems.map((cat) => ({
            ...cat,
            modules: cat.modules.filter((m) => m.isAccessible),
        })).filter((cat) => cat.modules.length > 0);
    }, [sidebarItems]);

    return {
        sidebarItems,
        accessibleSidebarItems,
        isLoading,
        error,
    };
}

export default useTierAccess;
