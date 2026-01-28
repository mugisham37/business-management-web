# 📱 MOBILE APP QUICK REFERENCE GUIDE

## Enterprise Business Management System - At-a-Glance Implementation Guide

**Last Updated:** January 2025  
**Related Documents:** MOBILE_INSPIRATION_ANALYSIS.md, MOBILE_UI_PATTERNS_SPEC.md, MOBILE_APPLICATION_ARCHITECTURE.md

---

## 🎯 THE BIG PICTURE

### What We're Building
A React Native mobile application for a 24-module enterprise business management system, inspired by the patterns in our `inspiration-mobile` e-commerce reference project.

### Core Technology Decisions

| Component | Choice | Reason |
|-----------|--------|--------|
| **Framework** | Expo SDK 54+ | Managed workflow, fast iteration |
| **Routing** | Expo Router | File-based, mirrors Next.js |
| **Styling** | NativeWind | Tailwind in React Native |
| **Data** | Apollo Client | GraphQL backend integration |
| **Offline** | WatermelonDB | SQLite-based persistence |
| **State** | Zustand | Simple global state |
| **Auth** | Custom JWT | Our NestJS backend |
| **Monitoring** | Sentry | Error tracking & replay |

---

## 📂 PROJECT STRUCTURE

```
mobile/
├── app/                      # Expo Router screens
│   ├── (auth)/               # Auth route group
│   │   ├── _layout.tsx
│   │   ├── index.tsx         # Welcome/Login
│   │   └── ...
│   ├── (tabs)/               # Main tab group
│   │   ├── _layout.tsx       # Tab configuration
│   │   ├── index.tsx         # Dashboard
│   │   ├── inventory.tsx
│   │   ├── pos.tsx
│   │   └── profile.tsx
│   ├── (inventory)/          # Inventory module stack
│   │   ├── products/[id].tsx
│   │   ├── adjust.tsx
│   │   └── ...
│   ├── _layout.tsx           # Root layout with providers
│   └── ...
├── components/               # Shared components
│   ├── core/                 # Buttons, inputs, cards
│   ├── layout/               # Headers, wrappers
│   ├── state/                # Loading, error, empty
│   ├── forms/                # Form components
│   ├── dashboard/            # Dashboard widgets
│   └── business/             # Entity cards
├── hooks/                    # Custom hooks
│   ├── useAuth.ts
│   ├── useProducts.ts
│   ├── useCart.ts
│   └── ...
├── lib/                      # Utilities
│   ├── apollo.ts             # Apollo Client setup
│   ├── storage.ts            # Secure storage
│   ├── sync.ts               # Offline sync
│   └── utils.ts              # Helpers
├── graphql/                  # GraphQL documents
│   ├── queries/
│   └── mutations/
├── types/                    # TypeScript types
└── assets/                   # Images, fonts
```

---

## 🎨 DESIGN TOKENS

### Colors

```javascript
// tailwind.config.js
colors: {
  primary: {
    DEFAULT: '#2563EB',  // Professional blue
    light: '#3B82F6',
    dark: '#1D4ED8',
  },
  background: {
    DEFAULT: '#121212',
    light: '#181818',
    lighter: '#282828',
  },
  surface: {
    DEFAULT: '#282828',
    light: '#3E3E3E',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    tertiary: '#6A6A6A',
  },
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
}
```

### Spacing

| Token | Value | Use For |
|-------|-------|---------|
| `px-6` | 24px | Screen horizontal padding |
| `p-4` | 16px | Card internal padding |
| `mb-3` | 12px | Gap between cards |
| `py-4` | 16px | Section vertical padding |

### Border Radius

| Token | Value | Use For |
|-------|-------|---------|
| `rounded-3xl` | 24px | Outer containers |
| `rounded-2xl` | 16px | Cards, buttons |
| `rounded-xl` | 12px | Small cards |
| `rounded-full` | 9999px | Circles, pills |

---

## 🧩 ESSENTIAL PATTERNS

### Screen Template

```tsx
import SafeScreen from '@/components/SafeScreen';
import { useEntity } from '@/hooks/useEntity';

export default function EntityScreen() {
  const { data, isLoading, isError } = useEntity();

  if (isLoading) return <LoadingState message="Loading..." />;
  if (isError) return <ErrorState title="Failed to load" />;
  if (data.length === 0) return <EmptyState icon="list" title="No items" />;

  return (
    <SafeScreen>
      {/* Header */}
      <Header title="Entity" />
      
      {/* Content */}
      <FlatList
        data={data}
        renderItem={({ item }) => <EntityCard item={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
      />
      
      {/* Bottom Action */}
      <BottomActionBar>
        <Button title="Add New" onPress={handleAdd} />
      </BottomActionBar>
    </SafeScreen>
  );
}
```

### Hook Template

```tsx
import { useQuery, useMutation } from '@apollo/client';
import { GET_ENTITIES, CREATE_ENTITY, UPDATE_ENTITY } from '@/graphql';

export function useEntities(options = {}) {
  const { data, loading, error, refetch } = useQuery(GET_ENTITIES, options);

  const [createMutation, { loading: creating }] = useMutation(CREATE_ENTITY, {
    refetchQueries: [{ query: GET_ENTITIES }],
  });

  const [updateMutation, { loading: updating }] = useMutation(UPDATE_ENTITY);

  return {
    entities: data?.entities ?? [],
    isLoading: loading,
    isError: !!error,
    refetch,
    create: (input) => createMutation({ variables: { input } }),
    update: (id, input) => updateMutation({ variables: { id, input } }),
    isCreating: creating,
    isUpdating: updating,
  };
}
```

---

## 📱 KEY SCREENS BY MODULE

### Authentication
- Welcome Screen
- Login Form
- Biometric Setup
- Tenant Selection

### Dashboard
- KPI Cards
- Alert Stack
- Quick Actions
- Activity Feed

### POS
- Cart (from inspiration)
- Product Scanner
- Customer Selection
- Payment Flow
- Receipt

### Inventory
- Product Grid (from inspiration)
- Product Detail (from inspiration)
- Stock Adjustment
- Transfer Request

### CRM
- Customer List
- Customer Detail
- Interaction Log

### Employee
- Time Clock
- Schedule View
- Timesheet

### Financial
- Invoice List
- Expense Form
- Receipt Capture

---

## ✅ CHECKLIST FOR EACH SCREEN

- [ ] Uses SafeScreen wrapper
- [ ] Handles loading state
- [ ] Handles error state
- [ ] Handles empty state
- [ ] Uses correct header pattern
- [ ] Has proper padding (px-6)
- [ ] Cards use rounded-3xl
- [ ] Buttons disabled during mutations
- [ ] Haptic feedback on actions
- [ ] Accessibility labels added
- [ ] Works offline (if applicable)
- [ ] Tested on both iOS/Android

---

## 🔗 KEY DIFFERENCES FROM INSPIRATION

| Inspiration | Our App |
|-------------|---------|
| REST API + Axios | GraphQL + Apollo |
| React Query | Apollo Client |
| Clerk Auth | Custom JWT Auth |
| No offline | Offline-first |
| No dashboard | Rich dashboards |
| 3 tabs | Role-based 4-5 tabs |
| Single tenant | Multi-tenant |
| Consumer app | Enterprise app |

---

## 🚀 IMPLEMENTATION PRIORITY

### Phase 1 (Weeks 1-3)
1. Project setup with Expo
2. NativeWind configuration
3. Apollo Client setup
4. Core components (SafeScreen, Header, Button)
5. Auth flow

### Phase 2 (Weeks 4-8)
6. Dashboard implementation
7. POS module (cart, scanner, payment)
8. Inventory module (list, detail, adjust)
9. CRM module (customers, contacts)

### Phase 3 (Weeks 9-12)
10. Employee module
11. Financial module
12. Warehouse module
13. Remaining modules

### Phase 4 (Weeks 13-16)
14. Offline capabilities
15. Performance optimization
16. Testing
17. Launch prep

---

## 📚 REFERENCE DOCUMENTS

1. **MOBILE_APPLICATION_ARCHITECTURE.md** - Technical architecture details
2. **MOBILE_INSPIRATION_ANALYSIS.md** - Deep analysis of inspiration project
3. **MOBILE_UI_PATTERNS_SPEC.md** - Detailed UI component specifications
4. **COMPREHENSIVE_PROJECT_ANALYSIS.md** - Backend module details

---

**Quick Start**: Open `inspiration-mobile` project as reference while developing. Adopt patterns directly where they apply. Extend with enterprise features as documented.
