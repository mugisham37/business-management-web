# 📱 REACT NATIVE MOBILE APPLICATION ARCHITECTURE

## Enterprise Business Management System - Mobile Companion

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Platform:** React Native (iOS & Android)

---

## 🎯 EXECUTIVE SUMMARY

This document provides a comprehensive architecture blueprint for building a **React Native mobile application** that serves as a powerful companion to the Enterprise Business Management System. The mobile app leverages React Native's native capabilities to deliver a seamless, high-performance experience optimized for mobile-first workflows.

### Mobile Application Vision

The mobile app is designed to be **more than just a responsive dashboard**—it's a purpose-built tool that takes advantage of mobile-specific capabilities:

- **📸 Camera Integration**: Product scanning, QR codes, document capture, receipt imaging
- **📍 Location Services**: Geofencing, delivery tracking, warehouse location
- **🔐 Biometric Authentication**: Face ID, Touch ID, fingerprint security
- **📶 Offline-First Architecture**: Full functionality without network connectivity
- **🔔 Push Notifications**: Real-time alerts for orders, inventory, approvals
- **📱 Native Device Features**: Contacts, calendar, file system integration

### Key Differentiators from Web Dashboard

| Aspect | Web Dashboard | Mobile Application |
|--------|---------------|-------------------|
| **Layout** | Horizontal, wide-screen optimized | Vertical scroll, touch-optimized |
| **Navigation** | Side panels, tabs, breadcrumbs | Bottom tabs, stack navigation, gestures |
| **Data Display** | Dense tables, multiple columns | Card-based, progressive disclosure |
| **Input** | Keyboard/mouse | Touch, camera, voice, biometrics |
| **Connectivity** | Always online | Offline-first with smart sync |
| **Context** | Desktop/office | Field, warehouse, store, on-the-go |

---

## 🏗️ ARCHITECTURE OVERVIEW

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    REACT NATIVE MOBILE APP                          │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Screens   │  │ Components  │  │   Hooks     │  │   Context   │ │
│  │  (24 Module │  │  (Shared    │  │  (Business  │  │  (Global    │ │
│  │   Screens)  │  │   UI Kit)   │  │   Logic)    │  │   State)    │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │
│         │                │                │                │        │
│  ┌──────▼────────────────▼────────────────▼────────────────▼──────┐ │
│  │                    FOUNDATION LAYER                             │ │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐  │ │
│  │  │ API Client │ │   Cache    │ │  Storage   │ │ Sync Engine  │  │ │
│  │  │ (GraphQL)  │ │  Manager   │ │  (SQLite)  │ │  (Offline)   │  │ │
│  │  └────────────┘ └────────────┘ └────────────┘ └──────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                    NATIVE MODULES LAYER                          │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │ │
│  │  │  Camera  │ │ Location │ │Biometric │ │   Push   │ │  File  │ │ │
│  │  │ Scanner  │ │ Services │ │   Auth   │ │  Notifs  │ │ System │ │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘ │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     NESTJS GRAPHQL BACKEND                          │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  24 Modules: Auth, CRM, Financial, Employee, Supplier,         ││
│  │  Inventory, Warehouse, POS, Location, Integration,             ││
│  │  Communication, B2B, Analytics, Backup, Disaster Recovery,     ││
│  │  Mobile, Cache, Database, Queue, Realtime, Security,           ││
│  │  Tenant, Logger, Health                                        ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

```typescript
// Core Framework
const mobileStack = {
  framework: 'React Native 0.73+',
  language: 'TypeScript 5.x',
  stateManagement: 'Zustand + React Query',
  navigation: 'React Navigation 6.x',
  graphql: 'Apollo Client 3.x',
  storage: 'WatermelonDB (SQLite)',
  animations: 'React Native Reanimated 3.x',
  gestures: 'React Native Gesture Handler',
  styling: 'NativeWind (Tailwind for RN)',
};

// Native Integrations
const nativeModules = {
  camera: 'react-native-vision-camera',
  qrScanner: 'react-native-vision-camera + ml-kit',
  biometrics: 'react-native-biometrics',
  location: 'react-native-location',
  push: 'react-native-firebase',
  storage: 'react-native-mmkv',
  keychain: 'react-native-keychain',
  bluetooth: 'react-native-ble-manager',
  nfc: 'react-native-nfc-manager',
};
```

---

## 📁 PROJECT STRUCTURE

```
mobile/
├── .env.example
├── .env.development
├── .env.production
├── package.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js
├── app.json
├── index.js
│
├── android/                          # Android native project
│   ├── app/
│   │   ├── build.gradle
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       └── java/
│   └── build.gradle
│
├── ios/                              # iOS native project
│   ├── Podfile
│   ├── BusinessManagement/
│   │   ├── AppDelegate.mm
│   │   ├── Info.plist
│   │   └── Entitlements.plist
│   └── BusinessManagement.xcworkspace
│
├── src/
│   ├── App.tsx                       # Root application component
│   ├── index.ts                      # App entry point
│   │
│   ├── @types/                       # TypeScript type definitions
│   │   ├── index.d.ts
│   │   ├── navigation.d.ts
│   │   ├── graphql.d.ts
│   │   └── native-modules.d.ts
│   │
│   ├── config/                       # App configuration
│   │   ├── index.ts
│   │   ├── env.ts                    # Environment variables
│   │   ├── api.config.ts             # API configuration
│   │   ├── theme.config.ts           # Theme configuration
│   │   ├── navigation.config.ts      # Navigation configuration
│   │   └── feature-flags.config.ts   # Feature flags
│   │
│   ├── lib/                          # Foundation layer (equivalent to web/lib)
│   │   ├── index.ts
│   │   ├── apollo/                   # GraphQL client setup
│   │   │   ├── index.ts
│   │   │   ├── client.ts             # Apollo Client configuration
│   │   │   ├── cache.ts              # Cache configuration
│   │   │   ├── links/                # Apollo Links
│   │   │   │   ├── auth.link.ts
│   │   │   │   ├── error.link.ts
│   │   │   │   ├── offline.link.ts
│   │   │   │   ├── retry.link.ts
│   │   │   │   └── compression.link.ts
│   │   │   └── persisted-queries.ts
│   │   │
│   │   ├── storage/                  # Local storage management
│   │   │   ├── index.ts
│   │   │   ├── mmkv.ts               # Fast key-value storage
│   │   │   ├── secure-storage.ts     # Encrypted storage (keychain)
│   │   │   ├── database/             # WatermelonDB setup
│   │   │   │   ├── index.ts
│   │   │   │   ├── schema.ts
│   │   │   │   ├── migrations.ts
│   │   │   │   └── models/           # Database models for each module
│   │   │   │       ├── Customer.model.ts
│   │   │   │       ├── Product.model.ts
│   │   │   │       ├── Invoice.model.ts
│   │   │   │       ├── Employee.model.ts
│   │   │   │       └── ... (all 24 modules)
│   │   │   └── sync/                 # Offline sync engine
│   │   │       ├── index.ts
│   │   │       ├── sync-engine.ts
│   │   │       ├── conflict-resolver.ts
│   │   │       └── sync-queue.ts
│   │   │
│   │   ├── auth/                     # Authentication utilities
│   │   │   ├── index.ts
│   │   │   ├── auth-manager.ts
│   │   │   ├── token-manager.ts
│   │   │   ├── biometric-auth.ts
│   │   │   ├── session-manager.ts
│   │   │   └── mfa-handler.ts
│   │   │
│   │   ├── api/                      # API utilities
│   │   │   ├── index.ts
│   │   │   ├── graphql-client.ts
│   │   │   ├── rest-client.ts        # For file uploads, etc.
│   │   │   ├── websocket-client.ts   # Real-time subscriptions
│   │   │   └── request-queue.ts      # Offline request queue
│   │   │
│   │   ├── cache/                    # Caching strategies
│   │   │   ├── index.ts
│   │   │   ├── cache-manager.ts
│   │   │   ├── image-cache.ts
│   │   │   └── query-cache.ts
│   │   │
│   │   ├── native/                   # Native module wrappers
│   │   │   ├── index.ts
│   │   │   ├── camera/
│   │   │   │   ├── index.ts
│   │   │   │   ├── camera-service.ts
│   │   │   │   ├── barcode-scanner.ts
│   │   │   │   ├── qr-scanner.ts
│   │   │   │   └── document-scanner.ts
│   │   │   ├── location/
│   │   │   │   ├── index.ts
│   │   │   │   ├── location-service.ts
│   │   │   │   ├── geofencing.ts
│   │   │   │   └── background-location.ts
│   │   │   ├── biometrics/
│   │   │   │   ├── index.ts
│   │   │   │   └── biometric-service.ts
│   │   │   ├── push/
│   │   │   │   ├── index.ts
│   │   │   │   ├── notification-service.ts
│   │   │   │   └── notification-handlers.ts
│   │   │   ├── bluetooth/
│   │   │   │   ├── index.ts
│   │   │   │   └── printer-service.ts
│   │   │   └── nfc/
│   │   │       ├── index.ts
│   │   │       └── nfc-service.ts
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── index.ts
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   ├── date-utils.ts
│   │   │   ├── currency-utils.ts
│   │   │   ├── file-utils.ts
│   │   │   ├── network-utils.ts
│   │   │   ├── device-utils.ts
│   │   │   └── performance-utils.ts
│   │   │
│   │   ├── graphql/                  # Generated GraphQL types & operations
│   │   │   ├── index.ts
│   │   │   ├── generated/
│   │   │   │   ├── graphql.ts        # Auto-generated types
│   │   │   │   └── hooks.ts          # Auto-generated hooks
│   │   │   ├── fragments/
│   │   │   │   └── ... (shared fragments)
│   │   │   ├── queries/
│   │   │   │   └── ... (organized by module)
│   │   │   ├── mutations/
│   │   │   │   └── ... (organized by module)
│   │   │   └── subscriptions/
│   │   │       └── ... (organized by module)
│   │   │
│   │   └── security/                 # Security utilities
│   │       ├── index.ts
│   │       ├── encryption.ts
│   │       ├── certificate-pinning.ts
│   │       └── jailbreak-detection.ts
│   │
│   ├── hooks/                        # Custom React hooks (business logic)
│   │   ├── index.ts
│   │   │
│   │   ├── core/                     # Core hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useTenant.ts
│   │   │   ├── useUser.ts
│   │   │   ├── usePermissions.ts
│   │   │   ├── useNetwork.ts
│   │   │   ├── useOffline.ts
│   │   │   └── useAppState.ts
│   │   │
│   │   ├── native/                   # Native feature hooks
│   │   │   ├── useCamera.ts
│   │   │   ├── useBarcodeScanner.ts
│   │   │   ├── useQRScanner.ts
│   │   │   ├── useDocumentScanner.ts
│   │   │   ├── useLocation.ts
│   │   │   ├── useGeofencing.ts
│   │   │   ├── useBiometrics.ts
│   │   │   ├── usePushNotifications.ts
│   │   │   ├── useBluetooth.ts
│   │   │   └── useNFC.ts
│   │   │
│   │   ├── data/                     # Data fetching hooks (per module)
│   │   │   ├── auth/
│   │   │   │   ├── useLogin.ts
│   │   │   │   ├── useLogout.ts
│   │   │   │   ├── useRefreshToken.ts
│   │   │   │   └── useMFA.ts
│   │   │   ├── crm/
│   │   │   │   ├── useCustomers.ts
│   │   │   │   ├── useCustomer.ts
│   │   │   │   ├── useCreateCustomer.ts
│   │   │   │   ├── useUpdateCustomer.ts
│   │   │   │   └── useCustomerInteractions.ts
│   │   │   ├── inventory/
│   │   │   │   ├── useProducts.ts
│   │   │   │   ├── useProduct.ts
│   │   │   │   ├── useProductByBarcode.ts
│   │   │   │   ├── useInventoryLevels.ts
│   │   │   │   ├── useStockAdjustment.ts
│   │   │   │   └── useCycleCount.ts
│   │   │   ├── pos/
│   │   │   │   ├── usePOSTransaction.ts
│   │   │   │   ├── useCart.ts
│   │   │   │   ├── usePayment.ts
│   │   │   │   ├── useReceipt.ts
│   │   │   │   └── useRegister.ts
│   │   │   ├── warehouse/
│   │   │   │   ├── usePicking.ts
│   │   │   │   ├── useReceiving.ts
│   │   │   │   ├── usePutaway.ts
│   │   │   │   ├── useBinLocations.ts
│   │   │   │   └── useShipments.ts
│   │   │   ├── financial/
│   │   │   │   ├── useInvoices.ts
│   │   │   │   ├── usePayments.ts
│   │   │   │   └── useExpenses.ts
│   │   │   ├── employee/
│   │   │   │   ├── useTimeTracking.ts
│   │   │   │   ├── useClockInOut.ts
│   │   │   │   └── useLeaveRequests.ts
│   │   │   └── ... (remaining 17 modules)
│   │   │
│   │   └── ui/                       # UI-related hooks
│   │       ├── useTheme.ts
│   │       ├── useKeyboard.ts
│   │       ├── useOrientation.ts
│   │       ├── useRefresh.ts
│   │       ├── useInfiniteScroll.ts
│   │       └── useBottomSheet.ts
│   │
│   ├── stores/                       # Global state management (Zustand)
│   │   ├── index.ts
│   │   ├── auth.store.ts
│   │   ├── user.store.ts
│   │   ├── tenant.store.ts
│   │   ├── cart.store.ts             # POS cart state
│   │   ├── offline.store.ts          # Offline queue state
│   │   ├── sync.store.ts             # Sync status state
│   │   ├── notification.store.ts
│   │   └── settings.store.ts
│   │
│   ├── context/                      # React Context providers
│   │   ├── index.ts
│   │   ├── AuthContext.tsx
│   │   ├── TenantContext.tsx
│   │   ├── ThemeContext.tsx
│   │   ├── NetworkContext.tsx
│   │   ├── LocationContext.tsx
│   │   └── NotificationContext.tsx
│   │
│   ├── components/                   # Reusable UI components
│   │   ├── index.ts
│   │   │
│   │   ├── ui/                       # Base UI components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Text/
│   │   │   ├── Card/
│   │   │   ├── Modal/
│   │   │   ├── BottomSheet/
│   │   │   ├── Toast/
│   │   │   ├── Skeleton/
│   │   │   ├── Avatar/
│   │   │   ├── Badge/
│   │   │   ├── Chip/
│   │   │   ├── Divider/
│   │   │   ├── Icon/
│   │   │   ├── Image/
│   │   │   ├── List/
│   │   │   ├── Tabs/
│   │   │   ├── Switch/
│   │   │   ├── Checkbox/
│   │   │   ├── Radio/
│   │   │   ├── Select/
│   │   │   ├── DatePicker/
│   │   │   ├── TimePicker/
│   │   │   ├── SearchBar/
│   │   │   ├── ProgressBar/
│   │   │   ├── Spinner/
│   │   │   └── FAB/
│   │   │
│   │   ├── layout/                   # Layout components
│   │   │   ├── Screen/
│   │   │   ├── Header/
│   │   │   ├── TabBar/
│   │   │   ├── DrawerMenu/
│   │   │   ├── KeyboardAvoidingView/
│   │   │   ├── SafeAreaView/
│   │   │   └── ScrollContainer/
│   │   │
│   │   ├── data-display/             # Data display components
│   │   │   ├── DataCard/
│   │   │   ├── StatCard/
│   │   │   ├── Chart/
│   │   │   ├── Table/
│   │   │   ├── Timeline/
│   │   │   ├── EmptyState/
│   │   │   ├── ErrorState/
│   │   │   └── LoadingState/
│   │   │
│   │   ├── forms/                    # Form components
│   │   │   ├── Form/
│   │   │   ├── FormField/
│   │   │   ├── AddressForm/
│   │   │   ├── PaymentForm/
│   │   │   ├── SearchForm/
│   │   │   └── FilterForm/
│   │   │
│   │   ├── native/                   # Native-specific components
│   │   │   ├── CameraView/
│   │   │   ├── BarcodeScanner/
│   │   │   ├── QRScanner/
│   │   │   ├── DocumentScanner/
│   │   │   ├── LocationPicker/
│   │   │   ├── MapView/
│   │   │   ├── BiometricPrompt/
│   │   │   ├── SignaturePad/
│   │   │   └── ImagePicker/
│   │   │
│   │   └── business/                 # Business-specific components
│   │       ├── CustomerCard/
│   │       ├── ProductCard/
│   │       ├── InvoiceCard/
│   │       ├── OrderCard/
│   │       ├── EmployeeCard/
│   │       ├── CartItem/
│   │       ├── ReceiptView/
│   │       ├── InventoryItem/
│   │       ├── PickingItem/
│   │       └── ... (module-specific)
│   │
│   ├── navigation/                   # Navigation setup
│   │   ├── index.ts
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   ├── stacks/
│   │   │   ├── HomeStack.tsx
│   │   │   ├── CRMStack.tsx
│   │   │   ├── InventoryStack.tsx
│   │   │   ├── POSStack.tsx
│   │   │   ├── WarehouseStack.tsx
│   │   │   ├── FinancialStack.tsx
│   │   │   ├── EmployeeStack.tsx
│   │   │   └── SettingsStack.tsx
│   │   ├── tabs/
│   │   │   └── MainTabNavigator.tsx
│   │   └── linking.ts                # Deep linking configuration
│   │
│   └── screens/                      # Application screens (24 modules)
│       ├── auth/
│       │   ├── LoginScreen.tsx
│       │   ├── BiometricLoginScreen.tsx
│       │   ├── ForgotPasswordScreen.tsx
│       │   ├── ResetPasswordScreen.tsx
│       │   ├── MFAScreen.tsx
│       │   └── PinSetupScreen.tsx
│       │
│       ├── home/
│       │   ├── DashboardScreen.tsx
│       │   ├── QuickActionsScreen.tsx
│       │   └── NotificationsScreen.tsx
│       │
│       ├── crm/
│       │   ├── CustomerListScreen.tsx
│       │   ├── CustomerDetailScreen.tsx
│       │   ├── CustomerFormScreen.tsx
│       │   ├── CustomerSearchScreen.tsx
│       │   ├── InteractionListScreen.tsx
│       │   └── LoyaltyScreen.tsx
│       │
│       ├── inventory/
│       │   ├── ProductListScreen.tsx
│       │   ├── ProductDetailScreen.tsx
│       │   ├── ProductScanScreen.tsx
│       │   ├── StockLevelsScreen.tsx
│       │   ├── StockAdjustmentScreen.tsx
│       │   ├── CycleCountScreen.tsx
│       │   ├── BatchTrackingScreen.tsx
│       │   └── BarcodeScannerScreen.tsx
│       │
│       ├── pos/
│       │   ├── POSHomeScreen.tsx
│       │   ├── CartScreen.tsx
│       │   ├── CheckoutScreen.tsx
│       │   ├── PaymentScreen.tsx
│       │   ├── ReceiptScreen.tsx
│       │   ├── CustomerLookupScreen.tsx
│       │   ├── ProductSearchScreen.tsx
│       │   ├── DiscountScreen.tsx
│       │   ├── RegisterScreen.tsx
│       │   ├── CashDrawerScreen.tsx
│       │   └── TransactionHistoryScreen.tsx
│       │
│       ├── warehouse/
│       │   ├── WarehouseHomeScreen.tsx
│       │   ├── PickingListScreen.tsx
│       │   ├── PickingDetailScreen.tsx
│       │   ├── PickingScanScreen.tsx
│       │   ├── ReceivingListScreen.tsx
│       │   ├── ReceivingDetailScreen.tsx
│       │   ├── ReceivingScanScreen.tsx
│       │   ├── PutawayListScreen.tsx
│       │   ├── PutawayDetailScreen.tsx
│       │   ├── PutawayScanScreen.tsx
│       │   ├── BinLocationScreen.tsx
│       │   ├── ShipmentListScreen.tsx
│       │   ├── ShipmentDetailScreen.tsx
│       │   └── ShipmentScanScreen.tsx
│       │
│       ├── financial/
│       │   ├── FinancialHomeScreen.tsx
│       │   ├── InvoiceListScreen.tsx
│       │   ├── InvoiceDetailScreen.tsx
│       │   ├── InvoiceFormScreen.tsx
│       │   ├── PaymentListScreen.tsx
│       │   ├── PaymentDetailScreen.tsx
│       │   ├── ExpenseListScreen.tsx
│       │   ├── ExpenseFormScreen.tsx
│       │   ├── ExpenseReceiptScreen.tsx  # Camera capture
│       │   └── ReportsScreen.tsx
│       │
│       ├── employee/
│       │   ├── EmployeeHomeScreen.tsx
│       │   ├── TimeClockScreen.tsx
│       │   ├── TimeSheetScreen.tsx
│       │   ├── LeaveRequestScreen.tsx
│       │   ├── PaystubScreen.tsx
│       │   └── ScheduleScreen.tsx
│       │
│       ├── supplier/
│       │   ├── SupplierListScreen.tsx
│       │   ├── SupplierDetailScreen.tsx
│       │   ├── PurchaseOrderListScreen.tsx
│       │   ├── PurchaseOrderDetailScreen.tsx
│       │   └── GoodsReceivedScreen.tsx
│       │
│       ├── location/
│       │   ├── LocationListScreen.tsx
│       │   ├── LocationDetailScreen.tsx
│       │   ├── LocationMapScreen.tsx
│       │   ├── TransferRequestScreen.tsx
│       │   └── DeliveryZoneScreen.tsx
│       │
│       ├── b2b/
│       │   ├── B2BCustomerListScreen.tsx
│       │   ├── B2BOrderListScreen.tsx
│       │   ├── QuoteListScreen.tsx
│       │   ├── QuoteDetailScreen.tsx
│       │   └── ContractListScreen.tsx
│       │
│       ├── communication/
│       │   ├── InboxScreen.tsx
│       │   ├── ComposeEmailScreen.tsx
│       │   ├── ComposeSMSScreen.tsx
│       │   └── NotificationSettingsScreen.tsx
│       │
│       ├── analytics/
│       │   ├── AnalyticsHomeScreen.tsx
│       │   ├── SalesDashboardScreen.tsx
│       │   ├── InventoryDashboardScreen.tsx
│       │   └── ReportViewerScreen.tsx
│       │
│       └── settings/
│           ├── SettingsScreen.tsx
│           ├── ProfileScreen.tsx
│           ├── SecurityScreen.tsx
│           ├── SyncSettingsScreen.tsx
│           ├── NotificationSettingsScreen.tsx
│           ├── ThemeSettingsScreen.tsx
│           ├── LanguageSettingsScreen.tsx
│           └── AboutScreen.tsx

```

---

## 🔧 FOUNDATION LAYER

The foundation layer mirrors the web application's `lib` directory, providing all core utilities and services needed across the mobile app.

### 1. Apollo GraphQL Client Setup

```typescript
// src/lib/apollo/client.ts
import { ApolloClient, InMemoryCache, from, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createUploadLink } from 'apollo-upload-client';
import { createClient } from 'graphql-ws';
import { authLink } from './links/auth.link';
import { errorLink } from './links/error.link';
import { offlineLink } from './links/offline.link';
import { retryLink } from './links/retry.link';
import { compressionLink } from './links/compression.link';
import { persistCache, MMKVWrapper } from 'apollo3-cache-persist';
import { storage } from '../storage/mmkv';
import { API_URL, WS_URL } from '../../config/env';

// Create HTTP link with file upload support
const httpLink = createUploadLink({
  uri: `${API_URL}/graphql`,
  headers: {
    'Apollo-Require-Preflight': 'true',
  },
});

// Create WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: WS_URL,
    connectionParams: async () => {
      const token = await getAccessToken();
      return {
        authorization: token ? `Bearer ${token}` : '',
      };
    },
    retryAttempts: 5,
    shouldRetry: () => true,
  })
);

// Split link based on operation type
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

// Configure cache
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        customers: {
          keyArgs: ['filter', 'sort'],
          merge(existing, incoming, { args }) {
            // Implement pagination merging
            if (!args?.offset) return incoming;
            return {
              ...incoming,
              nodes: [...(existing?.nodes || []), ...incoming.nodes],
            };
          },
        },
        products: {
          keyArgs: ['filter', 'sort'],
          merge(existing, incoming, { args }) {
            if (!args?.offset) return incoming;
            return {
              ...incoming,
              nodes: [...(existing?.nodes || []), ...incoming.nodes],
            };
          },
        },
        // Add merge functions for other paginated queries
      },
    },
  },
});

// Initialize cache persistence
export async function initializeApolloCache() {
  await persistCache({
    cache,
    storage: new MMKVWrapper(storage),
    debug: __DEV__,
    maxSize: 1024 * 1024 * 50, // 50MB
  });
}

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: from([
    offlineLink,      // Handle offline mutations
    errorLink,        // Handle errors
    retryLink,        // Retry failed requests
    compressionLink,  // Compress large payloads
    authLink,         // Add auth headers
    splitLink,        // HTTP/WS split
  ]),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});
```

### 2. Offline Link for Mutation Queue

```typescript
// src/lib/apollo/links/offline.link.ts
import { ApolloLink, Observable } from '@apollo/client';
import NetInfo from '@react-native-community/netinfo';
import { OfflineQueue } from '../../storage/sync/sync-queue';
import { getMainDefinition } from '@apollo/client/utilities';

class OfflineLinkClass extends ApolloLink {
  private queue: OfflineQueue;
  private isOnline: boolean = true;

  constructor() {
    super();
    this.queue = new OfflineQueue();
    this.setupNetworkListener();
  }

  private setupNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      if (wasOffline && this.isOnline) {
        // Process queued mutations when coming back online
        this.queue.processQueue();
      }
    });
  }

  request(operation, forward) {
    const definition = getMainDefinition(operation.query);
    const isMutation = 
      definition.kind === 'OperationDefinition' && 
      definition.operation === 'mutation';

    if (!this.isOnline && isMutation) {
      // Queue mutation for later
      return new Observable(observer => {
        this.queue.add({
          operation: operation.query,
          variables: operation.variables,
          operationName: operation.operationName,
        }).then(() => {
          observer.next({
            data: { __offline: true },
            errors: [],
          });
          observer.complete();
        }).catch(error => {
          observer.error(error);
        });
      });
    }

    return forward(operation);
  }
}

export const offlineLink = new OfflineLinkClass();
```

### 3. Local Database Schema (WatermelonDB)

```typescript
// src/lib/storage/database/schema.ts
import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    // Sync metadata
    tableSchema({
      name: 'sync_metadata',
      columns: [
        { name: 'table_name', type: 'string', isIndexed: true },
        { name: 'last_synced_at', type: 'number' },
        { name: 'version', type: 'number' },
      ],
    }),

    // Customers
    tableSchema({
      name: 'customers',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'customer_number', type: 'string', isIndexed: true },
        { name: 'first_name', type: 'string' },
        { name: 'last_name', type: 'string' },
        { name: 'company_name', type: 'string', isOptional: true },
        { name: 'email', type: 'string', isIndexed: true },
        { name: 'phone', type: 'string', isOptional: true },
        { name: 'type', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'credit_limit', type: 'number' },
        { name: 'loyalty_points', type: 'number' },
        { name: 'billing_address', type: 'string' }, // JSON
        { name: 'shipping_address', type: 'string' }, // JSON
        { name: 'is_synced', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Products
    tableSchema({
      name: 'products',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'sku', type: 'string', isIndexed: true },
        { name: 'barcode', type: 'string', isOptional: true, isIndexed: true },
        { name: 'name', type: 'string', isIndexed: true },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'category_id', type: 'string', isIndexed: true },
        { name: 'brand_id', type: 'string', isOptional: true },
        { name: 'cost_price', type: 'number' },
        { name: 'selling_price', type: 'number' },
        { name: 'stock_quantity', type: 'number' },
        { name: 'min_stock_level', type: 'number' },
        { name: 'images', type: 'string' }, // JSON array
        { name: 'attributes', type: 'string' }, // JSON
        { name: 'is_active', type: 'boolean' },
        { name: 'is_synced', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // POS Transactions (critical for offline POS)
    tableSchema({
      name: 'pos_transactions',
      columns: [
        { name: 'server_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'transaction_number', type: 'string', isIndexed: true },
        { name: 'customer_id', type: 'string', isOptional: true },
        { name: 'employee_id', type: 'string' },
        { name: 'register_id', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'subtotal', type: 'number' },
        { name: 'tax_amount', type: 'number' },
        { name: 'discount_amount', type: 'number' },
        { name: 'total_amount', type: 'number' },
        { name: 'paid_amount', type: 'number' },
        { name: 'change_amount', type: 'number' },
        { name: 'line_items', type: 'string' }, // JSON
        { name: 'payments', type: 'string' }, // JSON
        { name: 'is_synced', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Inventory Adjustments
    tableSchema({
      name: 'inventory_adjustments',
      columns: [
        { name: 'server_id', type: 'string', isOptional: true },
        { name: 'product_id', type: 'string', isIndexed: true },
        { name: 'type', type: 'string' },
        { name: 'quantity', type: 'number' },
        { name: 'reason', type: 'string' },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'location_id', type: 'string', isOptional: true },
        { name: 'batch_number', type: 'string', isOptional: true },
        { name: 'is_synced', type: 'boolean' },
        { name: 'created_at', type: 'number' },
      ],
    }),

    // Picking Tasks
    tableSchema({
      name: 'picking_tasks',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'picking_wave_id', type: 'string', isIndexed: true },
        { name: 'product_id', type: 'string' },
        { name: 'bin_location', type: 'string' },
        { name: 'quantity_to_pick', type: 'number' },
        { name: 'quantity_picked', type: 'number' },
        { name: 'status', type: 'string' },
        { name: 'is_synced', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Time Entries (for clock in/out)
    tableSchema({
      name: 'time_entries',
      columns: [
        { name: 'server_id', type: 'string', isOptional: true },
        { name: 'employee_id', type: 'string', isIndexed: true },
        { name: 'start_time', type: 'number' },
        { name: 'end_time', type: 'number', isOptional: true },
        { name: 'duration_minutes', type: 'number', isOptional: true },
        { name: 'work_type', type: 'string' },
        { name: 'location_id', type: 'string', isOptional: true },
        { name: 'clock_in_location', type: 'string' }, // JSON with GPS
        { name: 'clock_out_location', type: 'string', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'is_synced', type: 'boolean' },
        { name: 'created_at', type: 'number' },
      ],
    }),

    // Additional tables for other modules...
  ],
});
```

---

## 📸 NATIVE FEATURES INTEGRATION

### 1. Camera & Scanning System

The mobile app extensively uses camera capabilities for product scanning, document capture, and QR code reading.

```typescript
// src/lib/native/camera/barcode-scanner.ts
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { useCallback, useState } from 'react';

export interface ScanResult {
  type: 'barcode' | 'qrcode';
  value: string;
  format: string;
  corners: { x: number; y: number }[];
}

export function useBarcodeScanner(options?: {
  onScan?: (result: ScanResult) => void;
  scanInterval?: number;
  formats?: string[];
}) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);

  const codeScanner = useCodeScanner({
    codeTypes: options?.formats || [
      'ean-13', 'ean-8', 'upc-a', 'upc-e', 
      'code-128', 'code-39', 'code-93',
      'qr', 'data-matrix', 'pdf-417',
    ],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && isScanning) {
        const code = codes[0];
        if (code.value !== lastScannedCode) {
          setLastScannedCode(code.value);
          options?.onScan?.({
            type: code.type === 'qr' ? 'qrcode' : 'barcode',
            value: code.value,
            format: code.type,
            corners: code.corners || [],
          });
        }
      }
    },
  });

  const startScanning = useCallback(() => {
    setIsScanning(true);
    setLastScannedCode(null);
  }, []);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
  }, []);

  const resetScanner = useCallback(() => {
    setLastScannedCode(null);
  }, []);

  return {
    codeScanner,
    isScanning,
    lastScannedCode,
    startScanning,
    stopScanning,
    resetScanner,
  };
}

// src/hooks/native/useProductByBarcode.ts
import { useQuery, useLazyQuery } from '@apollo/client';
import { GET_PRODUCT_BY_BARCODE } from '../../lib/graphql/queries/inventory';
import { database } from '../../lib/storage/database';
import { Q } from '@nozbe/watermelondb';

export function useProductByBarcode() {
  const [fetchProduct, { loading, error }] = useLazyQuery(GET_PRODUCT_BY_BARCODE);

  const lookupProduct = async (barcode: string) => {
    // First check local database
    const localProducts = await database
      .get('products')
      .query(Q.where('barcode', barcode))
      .fetch();

    if (localProducts.length > 0) {
      return { product: localProducts[0], source: 'local' };
    }

    // If not found locally, fetch from server
    const result = await fetchProduct({ variables: { barcode } });
    if (result.data?.productByBarcode) {
      return { product: result.data.productByBarcode, source: 'server' };
    }

    return null;
  };

  return { lookupProduct, loading, error };
}
```

### 2. Document Scanner for Receipts/Invoices

```typescript
// src/lib/native/camera/document-scanner.ts
import { Camera, useCameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import { Skia, Canvas, Path } from '@shopify/react-native-skia';
import { useSharedValue, runOnJS } from 'react-native-reanimated';

export interface DocumentBounds {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
}

export function useDocumentScanner(options?: {
  onDocumentDetected?: (bounds: DocumentBounds) => void;
  autoCapture?: boolean;
}) {
  const documentBounds = useSharedValue<DocumentBounds | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<Camera>(null);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    // Use ML Kit or OpenCV for document detection
    const detected = detectDocument(frame);
    if (detected) {
      documentBounds.value = detected;
      if (options?.onDocumentDetected) {
        runOnJS(options.onDocumentDetected)(detected);
      }
    }
  }, []);

  const captureDocument = async () => {
    if (!cameraRef.current || !documentBounds.value) return null;

    const photo = await cameraRef.current.takePhoto({
      qualityPrioritization: 'quality',
    });

    // Apply perspective correction
    const correctedImage = await applyPerspectiveCorrection(
      photo.path,
      documentBounds.value
    );

    setCapturedImage(correctedImage);
    return correctedImage;
  };

  return {
    cameraRef,
    frameProcessor,
    documentBounds,
    capturedImage,
    captureDocument,
  };
}
```

### 3. Location Services

```typescript
// src/lib/native/location/location-service.ts
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

class LocationService {
  private watchId: number | null = null;

  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      const status = await Geolocation.requestAuthorization('whenInUse');
      return status === 'granted';
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  async getCurrentLocation(): Promise<LocationCoordinates> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            speed: position.coords.speed,
            heading: position.coords.heading,
            timestamp: position.timestamp,
          });
        },
        reject,
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  watchLocation(
    callback: (location: LocationCoordinates) => void,
    errorCallback?: (error: any) => void
  ): void {
    this.watchId = Geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          speed: position.coords.speed,
          heading: position.coords.heading,
          timestamp: position.timestamp,
        });
      },
      errorCallback,
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 5000,
        fastestInterval: 2000,
      }
    );
  }

  stopWatching(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
}

export const locationService = new LocationService();

// src/hooks/native/useLocation.ts
export function useLocation(options?: {
  enableTracking?: boolean;
  onLocationUpdate?: (location: LocationCoordinates) => void;
}) {
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
      try {
        const hasPermission = await locationService.requestPermission();
        if (!hasPermission) {
          throw new Error('Location permission denied');
        }

        const currentLocation = await locationService.getCurrentLocation();
        if (mounted) {
          setLocation(currentLocation);
          options?.onLocationUpdate?.(currentLocation);
        }

        if (options?.enableTracking) {
          locationService.watchLocation(
            (loc) => {
              if (mounted) {
                setLocation(loc);
                options?.onLocationUpdate?.(loc);
              }
            },
            (err) => {
              if (mounted) setError(err);
            }
          );
        }
      } catch (err) {
        if (mounted) setError(err as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
      locationService.stopWatching();
    };
  }, [options?.enableTracking]);

  const refreshLocation = async () => {
    try {
      const currentLocation = await locationService.getCurrentLocation();
      setLocation(currentLocation);
      return currentLocation;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return { location, error, loading, refreshLocation };
}
```

### 4. Biometric Authentication

```typescript
// src/lib/native/biometrics/biometric-service.ts
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import * as Keychain from 'react-native-keychain';

const rnBiometrics = new ReactNativeBiometrics();

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
}

class BiometricService {
  async isBiometricsAvailable(): Promise<{
    available: boolean;
    biometryType: BiometryTypes | undefined;
  }> {
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();
    return { available, biometryType };
  }

  async authenticate(promptMessage: string): Promise<BiometricAuthResult> {
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage,
        cancelButtonText: 'Cancel',
      });
      return { success };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  async createBiometricKeys(): Promise<{ publicKey: string }> {
    const { publicKey } = await rnBiometrics.createKeys();
    return { publicKey };
  }

  async signWithBiometrics(payload: string): Promise<{
    success: boolean;
    signature?: string;
    error?: string;
  }> {
    try {
      const { success, signature } = await rnBiometrics.createSignature({
        promptMessage: 'Confirm your identity',
        payload,
      });
      return { success, signature };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Signing failed',
      };
    }
  }

  async storeCredentials(
    username: string,
    password: string
  ): Promise<boolean> {
    await Keychain.setGenericPassword(username, password, {
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return true;
  }

  async getCredentials(): Promise<{
    username: string;
    password: string;
  } | null> {
    const credentials = await Keychain.getGenericPassword({
      authenticationPrompt: {
        title: 'Authenticate to access stored credentials',
      },
    });

    if (credentials) {
      return {
        username: credentials.username,
        password: credentials.password,
      };
    }
    return null;
  }
}

export const biometricService = new BiometricService();

// src/hooks/native/useBiometrics.ts
export function useBiometrics() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<BiometryTypes | undefined>();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    biometricService.isBiometricsAvailable().then(({ available, biometryType }) => {
      setIsAvailable(available);
      setBiometryType(biometryType);
    });
  }, []);

  const authenticate = async (message?: string) => {
    setIsAuthenticating(true);
    try {
      const result = await biometricService.authenticate(
        message || 'Confirm your identity'
      );
      return result;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getBiometryLabel = () => {
    switch (biometryType) {
      case BiometryTypes.FaceID:
        return 'Face ID';
      case BiometryTypes.TouchID:
        return 'Touch ID';
      case BiometryTypes.Biometrics:
        return 'Fingerprint';
      default:
        return 'Biometrics';
    }
  };

  return {
    isAvailable,
    biometryType,
    isAuthenticating,
    authenticate,
    getBiometryLabel,
  };
}
```

---

## 📱 MODULE-BY-MODULE INTEGRATION

### Module 1: AUTH MODULE

The authentication module handles all authentication flows including biometric login.

```typescript
// src/hooks/data/auth/useLogin.ts
import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION } from '../../../lib/graphql/mutations/auth';
import { useAuthStore } from '../../../stores/auth.store';
import { biometricService } from '../../../lib/native/biometrics/biometric-service';
import { secureStorage } from '../../../lib/storage/secure-storage';

export function useLogin() {
  const [login, { loading, error }] = useMutation(LOGIN_MUTATION);
  const { setAuth, setUser } = useAuthStore();

  const loginWithCredentials = async (email: string, password: string) => {
    const result = await login({
      variables: { input: { email, password } },
    });

    if (result.data?.login) {
      const { accessToken, refreshToken, user } = result.data.login;
      
      // Store tokens securely
      await secureStorage.setTokens(accessToken, refreshToken);
      
      // Update auth state
      setAuth({ accessToken, refreshToken, isAuthenticated: true });
      setUser(user);

      return { success: true, user };
    }

    return { success: false, error: result.errors?.[0]?.message };
  };

  const loginWithBiometrics = async () => {
    // First authenticate with biometrics
    const authResult = await biometricService.authenticate(
      'Sign in to Business Management'
    );

    if (!authResult.success) {
      return { success: false, error: 'Biometric authentication failed' };
    }

    // Get stored credentials
    const credentials = await biometricService.getCredentials();
    if (!credentials) {
      return { success: false, error: 'No stored credentials found' };
    }

    // Login with stored credentials
    return loginWithCredentials(credentials.username, credentials.password);
  };

  const setupBiometricLogin = async (email: string, password: string) => {
    const { available } = await biometricService.isBiometricsAvailable();
    if (!available) {
      return { success: false, error: 'Biometrics not available' };
    }

    await biometricService.storeCredentials(email, password);
    return { success: true };
  };

  return {
    loginWithCredentials,
    loginWithBiometrics,
    setupBiometricLogin,
    loading,
    error,
  };
}
```

### Module 2: CRM MODULE

```typescript
// src/hooks/data/crm/useCustomers.ts
import { useQuery } from '@apollo/client';
import { GET_CUSTOMERS } from '../../../lib/graphql/queries/crm';
import { database } from '../../../lib/storage/database';
import { useNetworkState } from '../../core/useNetwork';

export function useCustomers(options?: {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const { isConnected } = useNetworkState();

  const { data, loading, error, fetchMore, refetch } = useQuery(GET_CUSTOMERS, {
    variables: {
      args: {
        search: options?.search,
        status: options?.status,
        limit: options?.limit || 20,
        offset: options?.offset || 0,
      },
    },
    fetchPolicy: isConnected ? 'cache-and-network' : 'cache-only',
  });

  // Sync to local database when data changes
  useEffect(() => {
    if (data?.customers?.nodes) {
      syncCustomersToLocal(data.customers.nodes);
    }
  }, [data]);

  const loadMore = () => {
    if (!data?.customers?.pageInfo?.hasNextPage) return;

    fetchMore({
      variables: {
        args: {
          ...options,
          offset: data.customers.nodes.length,
        },
      },
    });
  };

  return {
    customers: data?.customers?.nodes || [],
    totalCount: data?.customers?.totalCount || 0,
    hasMore: data?.customers?.pageInfo?.hasNextPage || false,
    loading,
    error,
    loadMore,
    refetch,
  };
}

// src/hooks/data/crm/useCreateCustomer.ts
export function useCreateCustomer() {
  const [createCustomer, { loading }] = useMutation(CREATE_CUSTOMER_MUTATION);
  const { isConnected } = useNetworkState();

  const create = async (input: CreateCustomerInput) => {
    if (isConnected) {
      // Online: create directly on server
      const result = await createCustomer({ variables: { input } });
      if (result.data?.createCustomer) {
        await syncCustomerToLocal(result.data.createCustomer);
        return { success: true, customer: result.data.createCustomer };
      }
    } else {
      // Offline: create locally and queue for sync
      const localCustomer = await createLocalCustomer(input);
      await queueMutation('createCustomer', { input });
      return { success: true, customer: localCustomer, offline: true };
    }
  };

  return { create, loading };
}
```

### Module 3: INVENTORY MODULE (Heavy Camera Usage)

```typescript
// src/screens/inventory/BarcodeScannerScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { useBarcodeScanner } from '../../hooks/native/useBarcodeScanner';
import { useProductByBarcode } from '../../hooks/data/inventory/useProductByBarcode';
import { ProductDetailBottomSheet } from '../../components/business/ProductDetailBottomSheet';

export function BarcodeScannerScreen({ navigation }) {
  const device = useCameraDevice('back');
  const [scannedProduct, setScannedProduct] = useState(null);
  const { lookupProduct, loading } = useProductByBarcode();

  const handleScan = useCallback(async (result) => {
    const product = await lookupProduct(result.value);
    if (product) {
      setScannedProduct(product.product);
    } else {
      // Product not found - offer to create
      navigation.navigate('ProductForm', {
        barcode: result.value,
        mode: 'create',
      });
    }
  }, [lookupProduct, navigation]);

  const { codeScanner, isScanning, startScanning, stopScanning } = useBarcodeScanner({
    onScan: handleScan,
    scanInterval: 2000, // Debounce scans
  });

  if (!device) {
    return <Text>Camera not available</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        codeScanner={codeScanner}
      />
      
      {/* Scanning overlay */}
      <View style={styles.overlay}>
        <View style={styles.scanArea} />
      </View>

      {/* Action buttons */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={isScanning ? stopScanning : startScanning}
        >
          <Text style={styles.buttonText}>
            {isScanning ? 'Stop Scanning' : 'Start Scanning'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Product detail bottom sheet */}
      <ProductDetailBottomSheet
        product={scannedProduct}
        visible={!!scannedProduct}
        onClose={() => setScannedProduct(null)}
        onAddToCart={(product) => {
          // Add to POS cart
        }}
        onAdjustStock={(product) => {
          navigation.navigate('StockAdjustment', { product });
        }}
      />
    </View>
  );
}

// src/hooks/data/inventory/useStockAdjustment.ts
export function useStockAdjustment() {
  const [adjustStock] = useMutation(ADJUST_INVENTORY_MUTATION);
  const { isConnected } = useNetworkState();
  const { location } = useLocation();

  const adjust = async (input: AdjustInventoryInput) => {
    // Capture location for adjustment
    const adjustmentInput = {
      ...input,
      location: location ? {
        latitude: location.latitude,
        longitude: location.longitude,
      } : undefined,
      timestamp: Date.now(),
    };

    if (isConnected) {
      const result = await adjustStock({ variables: { input: adjustmentInput } });
      return {
        success: true,
        transaction: result.data?.adjustInventory,
      };
    } else {
      // Queue for offline sync
      await database.write(async () => {
        await database.get('inventory_adjustments').create((adj) => {
          adj.productId = input.productId;
          adj.type = input.type;
          adj.quantity = input.quantity;
          adj.reason = input.reason;
          adj.notes = input.notes;
          adj.isSynced = false;
          adj.createdAt = Date.now();
        });
      });
      await queueMutation('adjustInventory', { input: adjustmentInput });
      return { success: true, offline: true };
    }
  };

  return { adjust };
}
```

### Module 4: POS MODULE (Offline-Critical)

```typescript
// src/stores/cart.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '../lib/storage/mmkv';

interface CartItem {
  productId: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  discount: number;
  taxRate: number;
}

interface CartStore {
  items: CartItem[];
  customerId: string | null;
  discountAmount: number;
  discountType: 'percentage' | 'fixed';
  notes: string;
  
  // Actions
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  setCustomer: (customerId: string | null) => void;
  applyDiscount: (amount: number, type: 'percentage' | 'fixed') => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;
  
  // Computed
  getSubtotal: () => number;
  getTaxAmount: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      customerId: null,
      discountAmount: 0,
      discountType: 'fixed',
      notes: '',

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.productId === product.id
          );

          if (existingIndex >= 0) {
            const newItems = [...state.items];
            newItems[existingIndex].quantity += quantity;
            return { items: newItems };
          }

          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                sku: product.sku,
                name: product.name,
                price: product.sellingPrice,
                quantity,
                discount: 0,
                taxRate: product.taxRate || 0,
              },
            ],
          };
        });
      },

      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.max(0, quantity) }
              : item
          ).filter((item) => item.quantity > 0),
        }));
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      setCustomer: (customerId) => set({ customerId }),
      applyDiscount: (amount, type) => set({ discountAmount: amount, discountType: type }),
      setNotes: (notes) => set({ notes }),
      clearCart: () => set({ items: [], customerId: null, discountAmount: 0, notes: '' }),

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity - item.discount,
          0
        );
      },

      getTaxAmount: () => {
        return get().items.reduce(
          (sum, item) => sum + (item.price * item.quantity - item.discount) * item.taxRate,
          0
        );
      },

      getDiscountAmount: () => {
        const { discountAmount, discountType } = get();
        const subtotal = get().getSubtotal();
        return discountType === 'percentage'
          ? subtotal * (discountAmount / 100)
          : discountAmount;
      },

      getTotal: () => {
        return get().getSubtotal() + get().getTaxAmount() - get().getDiscountAmount();
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);

// src/hooks/data/pos/usePOSTransaction.ts
export function usePOSTransaction() {
  const [createTransaction] = useMutation(CREATE_POS_TRANSACTION_MUTATION);
  const { items, customerId, discountAmount, notes, clearCart } = useCartStore();
  const { isConnected } = useNetworkState();
  const { location } = useLocation();
  const { user } = useAuthStore();

  const processTransaction = async (payments: PaymentInput[]) => {
    const transactionNumber = generateTransactionNumber();
    
    const transactionInput = {
      transactionNumber,
      customerId,
      employeeId: user.id,
      registerId: user.currentRegisterId,
      lineItems: items.map((item) => ({
        productId: item.productId,
        sku: item.sku,
        description: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        discount: item.discount,
        taxRate: item.taxRate,
      })),
      payments,
      discountAmount,
      notes,
      location: location ? {
        latitude: location.latitude,
        longitude: location.longitude,
      } : undefined,
    };

    if (isConnected) {
      try {
        const result = await createTransaction({
          variables: { input: transactionInput },
        });

        if (result.data?.createPOSTransaction) {
          clearCart();
          return {
            success: true,
            transaction: result.data.createPOSTransaction,
          };
        }
      } catch (error) {
        // Fall back to offline mode on network error
        return processOfflineTransaction(transactionInput);
      }
    }

    return processOfflineTransaction(transactionInput);
  };

  const processOfflineTransaction = async (input: CreatePOSTransactionInput) => {
    // Store transaction locally
    const localTransaction = await database.write(async () => {
      return await database.get('pos_transactions').create((txn) => {
        txn.transactionNumber = input.transactionNumber;
        txn.customerId = input.customerId;
        txn.employeeId = input.employeeId;
        txn.registerId = input.registerId;
        txn.status = 'completed';
        txn.subtotal = calculateSubtotal(input.lineItems);
        txn.taxAmount = calculateTax(input.lineItems);
        txn.discountAmount = input.discountAmount;
        txn.totalAmount = calculateTotal(input);
        txn.lineItems = JSON.stringify(input.lineItems);
        txn.payments = JSON.stringify(input.payments);
        txn.isSynced = false;
        txn.createdAt = Date.now();
      });
    });

    // Update local inventory
    for (const item of input.lineItems) {
      await updateLocalInventory(item.productId, -item.quantity);
    }

    // Queue for sync when online
    await queueMutation('createPOSTransaction', { input });

    clearCart();
    return {
      success: true,
      transaction: localTransaction,
      offline: true,
    };
  };

  return { processTransaction };
}
```

### Module 5: WAREHOUSE MODULE (Heavy Scanning)

```typescript
// src/screens/warehouse/PickingScanScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Vibration } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { useBarcodeScanner } from '../../hooks/native/useBarcodeScanner';
import { usePicking } from '../../hooks/data/warehouse/usePicking';
import { PickingTaskCard } from '../../components/business/PickingTaskCard';
import { SuccessAnimation } from '../../components/ui/SuccessAnimation';
import Haptics from 'react-native-haptic-feedback';

export function PickingScanScreen({ route, navigation }) {
  const { pickingWaveId } = route.params;
  const device = useCameraDevice('back');
  const [currentTask, setCurrentTask] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { tasks, confirmPick, loading } = usePicking(pickingWaveId);

  const handleScan = useCallback(async (result) => {
    // Find matching task for scanned barcode
    const matchingTask = tasks.find(
      (task) => task.product.barcode === result.value ||
                task.binLocation.code === result.value
    );

    if (matchingTask) {
      if (!currentTask) {
        // First scan - set current task
        setCurrentTask(matchingTask);
        Haptics.trigger('impactMedium');
      } else if (currentTask.id === matchingTask.id) {
        // Second scan of same item - confirm pick
        await confirmPick(matchingTask.id, matchingTask.quantityToPick);
        Haptics.trigger('notificationSuccess');
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setCurrentTask(null);
        }, 1500);
      }
    } else {
      // Wrong item scanned
      Haptics.trigger('notificationError');
      Vibration.vibrate([100, 50, 100]);
    }
  }, [tasks, currentTask, confirmPick]);

  const { codeScanner } = useBarcodeScanner({ onScan: handleScan });

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        device={device}
        isActive={!showSuccess}
        codeScanner={codeScanner}
      />

      {/* Current task info */}
      {currentTask && (
        <View style={styles.taskOverlay}>
          <PickingTaskCard
            task={currentTask}
            highlighted
            instructions="Scan product barcode to confirm pick"
          />
        </View>
      )}

      {/* Progress indicator */}
      <View style={styles.progress}>
        <Text style={styles.progressText}>
          {tasks.filter((t) => t.status === 'completed').length} / {tasks.length} items
        </Text>
      </View>

      {/* Success animation */}
      {showSuccess && <SuccessAnimation />}
    </View>
  );
}

// src/hooks/data/warehouse/usePicking.ts
export function usePicking(pickingWaveId: string) {
  const [confirmPickMutation] = useMutation(CONFIRM_PICK_MUTATION);
  const { isConnected } = useNetworkState();
  
  const { data, loading, refetch } = useQuery(GET_PICKING_TASKS, {
    variables: { pickingWaveId },
    pollInterval: isConnected ? 5000 : 0, // Poll for updates when online
  });

  const confirmPick = async (taskId: string, quantityPicked: number) => {
    if (isConnected) {
      await confirmPickMutation({
        variables: {
          input: { taskId, quantityPicked, confirmedAt: new Date().toISOString() },
        },
        optimisticResponse: {
          confirmPick: {
            __typename: 'PickingTask',
            id: taskId,
            status: 'completed',
            quantityPicked,
          },
        },
      });
    } else {
      // Update local database
      await database.write(async () => {
        const task = await database.get('picking_tasks').find(taskId);
        await task.update((t) => {
          t.quantityPicked = quantityPicked;
          t.status = 'completed';
          t.isSynced = false;
        });
      });
      await queueMutation('confirmPick', {
        input: { taskId, quantityPicked, confirmedAt: new Date().toISOString() },
      });
    }
  };

  return {
    tasks: data?.pickingTasks || [],
    loading,
    confirmPick,
    refetch,
  };
}
```

### Module 6: EMPLOYEE MODULE (Time Tracking with Location)

```typescript
// src/screens/employee/TimeClockScreen.tsx
export function TimeClockScreen() {
  const { user } = useAuthStore();
  const { location, loading: locationLoading, refreshLocation } = useLocation({
    enableTracking: false,
  });
  const { clockIn, clockOut, currentEntry, loading } = useTimeTracking(user.employeeId);
  const [isClockedIn, setIsClockedIn] = useState(!!currentEntry);

  const handleClockIn = async () => {
    const currentLocation = await refreshLocation();
    
    const result = await clockIn({
      location: currentLocation ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        accuracy: currentLocation.accuracy,
      } : undefined,
    });

    if (result.success) {
      setIsClockedIn(true);
      Haptics.trigger('notificationSuccess');
    }
  };

  const handleClockOut = async () => {
    const currentLocation = await refreshLocation();
    
    const result = await clockOut({
      location: currentLocation ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        accuracy: currentLocation.accuracy,
      } : undefined,
    });

    if (result.success) {
      setIsClockedIn(false);
      Haptics.trigger('notificationSuccess');
    }
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.greeting}>
          Hello, {user.firstName}!
        </Text>
        
        <TimeClock
          isClockedIn={isClockedIn}
          currentEntry={currentEntry}
        />

        <View style={styles.locationInfo}>
          {location && (
            <Text style={styles.locationText}>
              📍 Location captured
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.clockButton,
            isClockedIn ? styles.clockOutButton : styles.clockInButton,
          ]}
          onPress={isClockedIn ? handleClockOut : handleClockIn}
          disabled={loading || locationLoading}
        >
          {loading || locationLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>
              {isClockedIn ? 'Clock Out' : 'Clock In'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

// src/hooks/data/employee/useTimeTracking.ts
export function useTimeTracking(employeeId: string) {
  const [clockInMutation] = useMutation(CLOCK_IN_MUTATION);
  const [clockOutMutation] = useMutation(CLOCK_OUT_MUTATION);
  const { isConnected } = useNetworkState();

  const { data, refetch } = useQuery(GET_CURRENT_TIME_ENTRY, {
    variables: { employeeId },
  });

  const clockIn = async (input: ClockInInput) => {
    const timeEntry = {
      employeeId,
      startTime: new Date().toISOString(),
      clockInLocation: input.location,
      workType: 'regular',
    };

    if (isConnected) {
      const result = await clockInMutation({ variables: { input: timeEntry } });
      return { success: true, entry: result.data?.clockIn };
    } else {
      // Store locally
      await database.write(async () => {
        await database.get('time_entries').create((entry) => {
          entry.employeeId = employeeId;
          entry.startTime = Date.now();
          entry.workType = 'regular';
          entry.clockInLocation = JSON.stringify(input.location);
          entry.isSynced = false;
        });
      });
      await queueMutation('clockIn', { input: timeEntry });
      return { success: true, offline: true };
    }
  };

  const clockOut = async (input: ClockOutInput) => {
    const currentEntry = data?.currentTimeEntry;
    if (!currentEntry) return { success: false, error: 'No active time entry' };

    const clockOutData = {
      timeEntryId: currentEntry.id,
      endTime: new Date().toISOString(),
      clockOutLocation: input.location,
    };

    if (isConnected) {
      const result = await clockOutMutation({ variables: clockOutData });
      return { success: true, entry: result.data?.clockOut };
    } else {
      // Update local entry
      await database.write(async () => {
        const entries = await database
          .get('time_entries')
          .query(Q.where('employee_id', employeeId), Q.where('end_time', null))
          .fetch();
        
        if (entries.length > 0) {
          await entries[0].update((entry) => {
            entry.endTime = Date.now();
            entry.clockOutLocation = JSON.stringify(input.location);
            entry.isSynced = false;
          });
        }
      });
      await queueMutation('clockOut', clockOutData);
      return { success: true, offline: true };
    }
  };

  return {
    clockIn,
    clockOut,
    currentEntry: data?.currentTimeEntry,
    refetch,
  };
}
```

---

## 🔄 OFFLINE SYNC ENGINE

### Complete Sync Architecture

```typescript
// src/lib/storage/sync/sync-engine.ts
import { database } from '../database';
import { apolloClient } from '../../apollo/client';
import NetInfo from '@react-native-community/netinfo';
import { Q } from '@nozbe/watermelondb';

interface SyncItem {
  id: string;
  tableName: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  createdAt: number;
  retryCount: number;
  lastError?: string;
}

class SyncEngine {
  private isSyncing = false;
  private syncQueue: SyncItem[] = [];

  constructor() {
    this.setupNetworkListener();
    this.loadQueueFromStorage();
  }

  private setupNetworkListener() {
    NetInfo.addEventListener((state) => {
      if (state.isConnected && !this.isSyncing) {
        this.processPendingSync();
      }
    });
  }

  async queueForSync(item: Omit<SyncItem, 'id' | 'createdAt' | 'retryCount'>) {
    const syncItem: SyncItem = {
      ...item,
      id: generateUUID(),
      createdAt: Date.now(),
      retryCount: 0,
    };

    this.syncQueue.push(syncItem);
    await this.saveQueueToStorage();
  }

  async processPendingSync() {
    if (this.isSyncing || this.syncQueue.length === 0) return;

    const { isConnected } = await NetInfo.fetch();
    if (!isConnected) return;

    this.isSyncing = true;

    try {
      // Sort by creation time (oldest first)
      const sortedQueue = [...this.syncQueue].sort(
        (a, b) => a.createdAt - b.createdAt
      );

      for (const item of sortedQueue) {
        try {
          await this.syncItem(item);
          // Remove from queue on success
          this.syncQueue = this.syncQueue.filter((q) => q.id !== item.id);
        } catch (error) {
          // Update retry count
          const idx = this.syncQueue.findIndex((q) => q.id === item.id);
          if (idx >= 0) {
            this.syncQueue[idx].retryCount++;
            this.syncQueue[idx].lastError = 
              error instanceof Error ? error.message : 'Unknown error';

            // Remove if max retries exceeded
            if (this.syncQueue[idx].retryCount > 5) {
              await this.moveToFailedQueue(this.syncQueue[idx]);
              this.syncQueue.splice(idx, 1);
            }
          }
        }
      }

      await this.saveQueueToStorage();
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncItem(item: SyncItem) {
    const mutation = this.getMutationForItem(item);
    
    const result = await apolloClient.mutate({
      mutation,
      variables: item.data,
    });

    if (result.errors?.length) {
      throw new Error(result.errors[0].message);
    }

    // Update local record to mark as synced
    await database.write(async () => {
      const record = await database.get(item.tableName).find(item.data.localId);
      if (record) {
        await record.update((r) => {
          r.isSynced = true;
          r.serverId = result.data[`${item.operation}${item.tableName}`]?.id;
        });
      }
    });
  }

  private getMutationForItem(item: SyncItem) {
    const mutations = {
      customers: {
        create: CREATE_CUSTOMER_MUTATION,
        update: UPDATE_CUSTOMER_MUTATION,
        delete: DELETE_CUSTOMER_MUTATION,
      },
      products: {
        create: CREATE_PRODUCT_MUTATION,
        update: UPDATE_PRODUCT_MUTATION,
        delete: DELETE_PRODUCT_MUTATION,
      },
      pos_transactions: {
        create: CREATE_POS_TRANSACTION_MUTATION,
      },
      inventory_adjustments: {
        create: ADJUST_INVENTORY_MUTATION,
      },
      time_entries: {
        create: CLOCK_IN_MUTATION,
        update: CLOCK_OUT_MUTATION,
      },
      picking_tasks: {
        update: CONFIRM_PICK_MUTATION,
      },
      // Add more table-mutation mappings
    };

    return mutations[item.tableName]?.[item.operation];
  }

  getSyncStatus() {
    return {
      pending: this.syncQueue.length,
      isSyncing: this.isSyncing,
      oldestItem: this.syncQueue[0]?.createdAt,
    };
  }
}

export const syncEngine = new SyncEngine();
```

### Conflict Resolution

```typescript
// src/lib/storage/sync/conflict-resolver.ts
export interface ConflictResolution {
  strategy: 'client-wins' | 'server-wins' | 'merge' | 'manual';
  mergeRules?: Record<string, 'client' | 'server' | 'newer'>;
}

class ConflictResolver {
  private strategies: Record<string, ConflictResolution> = {
    customers: {
      strategy: 'merge',
      mergeRules: {
        email: 'server',
        phone: 'newer',
        notes: 'client',
        lastInteractionDate: 'newer',
      },
    },
    products: {
      strategy: 'server-wins', // Price/inventory managed centrally
    },
    pos_transactions: {
      strategy: 'client-wins', // POS transactions are source of truth
    },
    time_entries: {
      strategy: 'client-wins', // Employee clock records are authoritative
    },
    picking_tasks: {
      strategy: 'merge',
      mergeRules: {
        quantityPicked: 'client', // Field work wins
        status: 'newer',
      },
    },
  };

  async resolveConflict(
    tableName: string,
    clientData: any,
    serverData: any
  ): Promise<any> {
    const resolution = this.strategies[tableName];

    switch (resolution?.strategy) {
      case 'client-wins':
        return clientData;
      case 'server-wins':
        return serverData;
      case 'merge':
        return this.mergeData(clientData, serverData, resolution.mergeRules || {});
      case 'manual':
        throw new ConflictError(tableName, clientData, serverData);
      default:
        return serverData; // Default to server
    }
  }

  private mergeData(
    client: any,
    server: any,
    rules: Record<string, 'client' | 'server' | 'newer'>
  ): any {
    const merged = { ...server };

    for (const [field, rule] of Object.entries(rules)) {
      switch (rule) {
        case 'client':
          merged[field] = client[field];
          break;
        case 'server':
          merged[field] = server[field];
          break;
        case 'newer':
          const clientTime = client[`${field}UpdatedAt`] || client.updatedAt;
          const serverTime = server[`${field}UpdatedAt`] || server.updatedAt;
          merged[field] = clientTime > serverTime ? client[field] : server[field];
          break;
      }
    }

    return merged;
  }
}

export const conflictResolver = new ConflictResolver();
```

---

## 🧭 NAVIGATION ARCHITECTURE

### Main Navigation Structure

```typescript
// src/navigation/RootNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/auth.store';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { linking } from './linking';

const RootStack = createNativeStackNavigator();

export function RootNavigator() {
  const { isAuthenticated } = useAuthStore();

  return (
    <NavigationContainer linking={linking}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

// src/navigation/MainNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { usePermissions } from '../hooks/core/usePermissions';

const Tab = createBottomTabNavigator();

export function MainNavigator() {
  const { hasPermission } = usePermissions();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
          tabBarLabel: 'Home',
        }}
      />

      {hasPermission('pos.access') && (
        <Tab.Screen
          name="POS"
          component={POSStack}
          options={{
            tabBarIcon: ({ color }) => <POSIcon color={color} />,
            tabBarLabel: 'POS',
          }}
        />
      )}

      {hasPermission('inventory.access') && (
        <Tab.Screen
          name="Inventory"
          component={InventoryStack}
          options={{
            tabBarIcon: ({ color }) => <InventoryIcon color={color} />,
            tabBarLabel: 'Inventory',
          }}
        />
      )}

      {hasPermission('warehouse.access') && (
        <Tab.Screen
          name="Warehouse"
          component={WarehouseStack}
          options={{
            tabBarIcon: ({ color }) => <WarehouseIcon color={color} />,
            tabBarLabel: 'Warehouse',
          }}
        />
      )}

      <Tab.Screen
        name="More"
        component={MoreStack}
        options={{
          tabBarIcon: ({ color }) => <MoreIcon color={color} />,
          tabBarLabel: 'More',
        }}
      />
    </Tab.Navigator>
  );
}
```

### Role-Based Navigation

```typescript
// src/hooks/core/usePermissions.ts
export function usePermissions() {
  const { user } = useAuthStore();

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user?.permissions) return false;
      
      // Check for superadmin
      if (user.role === 'superadmin') return true;
      
      // Check specific permission
      return user.permissions.includes(permission) ||
             user.permissions.includes(permission.split('.')[0] + '.*');
    },
    [user?.permissions, user?.role]
  );

  const hasAnyPermission = useCallback(
    (permissions: string[]): boolean => {
      return permissions.some((p) => hasPermission(p));
    },
    [hasPermission]
  );

  const hasAllPermissions = useCallback(
    (permissions: string[]): boolean => {
      return permissions.every((p) => hasPermission(p));
    },
    [hasPermission]
  );

  return { hasPermission, hasAnyPermission, hasAllPermissions };
}
```

---

## 🔔 PUSH NOTIFICATIONS

### Notification Setup

```typescript
// src/lib/native/push/notification-service.ts
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { apolloClient } from '../../apollo/client';
import { REGISTER_DEVICE_TOKEN_MUTATION } from '../../graphql/mutations/notification';

class NotificationService {
  async initialize() {
    // Request permission
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) return false;

    // Get FCM token
    const token = await messaging().getToken();
    await this.registerToken(token);

    // Listen for token refresh
    messaging().onTokenRefresh(this.registerToken);

    // Create notification channels
    await this.createChannels();

    // Set up message handlers
    this.setupMessageHandlers();

    return true;
  }

  private async registerToken(token: string) {
    await apolloClient.mutate({
      mutation: REGISTER_DEVICE_TOKEN_MUTATION,
      variables: {
        input: {
          token,
          platform: Platform.OS,
          deviceInfo: await getDeviceInfo(),
        },
      },
    });
  }

  private async createChannels() {
    await notifee.createChannel({
      id: 'orders',
      name: 'Orders',
      importance: AndroidImportance.HIGH,
      vibration: true,
      sound: 'default',
    });

    await notifee.createChannel({
      id: 'inventory',
      name: 'Inventory Alerts',
      importance: AndroidImportance.HIGH,
    });

    await notifee.createChannel({
      id: 'approvals',
      name: 'Approval Requests',
      importance: AndroidImportance.HIGH,
    });

    await notifee.createChannel({
      id: 'sync',
      name: 'Sync Status',
      importance: AndroidImportance.LOW,
    });
  }

  private setupMessageHandlers() {
    // Foreground messages
    messaging().onMessage(async (remoteMessage) => {
      await this.displayNotification(remoteMessage);
    });

    // Background message interaction
    messaging().onNotificationOpenedApp((remoteMessage) => {
      this.handleNotificationPress(remoteMessage);
    });

    // App opened from quit state via notification
    messaging().getInitialNotification().then((remoteMessage) => {
      if (remoteMessage) {
        this.handleNotificationPress(remoteMessage);
      }
    });

    // Notifee foreground events
    notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        this.handleNotificationPress(detail.notification);
      }
    });
  }

  private async displayNotification(message: any) {
    await notifee.displayNotification({
      title: message.notification?.title,
      body: message.notification?.body,
      android: {
        channelId: message.data?.channelId || 'default',
        pressAction: { id: 'default' },
      },
      data: message.data,
    });
  }

  private handleNotificationPress(notification: any) {
    const { type, entityId } = notification.data || {};

    switch (type) {
      case 'new_order':
        navigate('OrderDetail', { orderId: entityId });
        break;
      case 'low_stock':
        navigate('ProductDetail', { productId: entityId });
        break;
      case 'approval_request':
        navigate('ApprovalDetail', { requestId: entityId });
        break;
      case 'picking_assigned':
        navigate('PickingDetail', { pickingWaveId: entityId });
        break;
      // Add more cases
    }
  }
}

export const notificationService = new NotificationService();
```

---

## 📊 REMAINING MODULES SUMMARY

### Modules 7-24 Integration Pattern

Each of the remaining modules follows the same architectural pattern:

| # | Module | Key Mobile Features |
|---|--------|-------------------|
| 7 | **Financial** | Invoice capture (camera), expense receipts, payment recording |
| 8 | **Supplier** | PO management, goods receiving with barcode scanning |
| 9 | **Location** | Multi-location management, map views, geofencing |
| 10 | **B2B** | Quote creation, order management, customer hierarchy |
| 11 | **Communication** | In-app messaging, email/SMS templates |
| 12 | **Analytics** | Mobile dashboards, offline reports |
| 13 | **Integration** | Webhook management, sync status |
| 14 | **Backup** | Backup status monitoring |
| 15 | **Disaster Recovery** | Recovery status, failover alerts |
| 16 | **Realtime** | Live updates via WebSocket |
| 17 | **Security** | Session management, security alerts |
| 18 | **Tenant** | Tenant settings, branding |
| 19 | **Logger** | Error reporting, diagnostics |
| 20 | **Health** | System status monitoring |
| 21 | **Cache** | Cache management controls |
| 22 | **Database** | Sync statistics, storage usage |
| 23 | **Queue** | Job queue monitoring |
| 24 | **Mobile** | Mobile-specific settings, device management |

### Standardized Hook Pattern for All Modules

```typescript
// Template for any module hook
export function use[EntityName]s(options?: {
  filter?: FilterInput;
  sort?: SortInput;
  limit?: number;
}) {
  const { isConnected } = useNetworkState();

  const { data, loading, error, fetchMore, refetch } = useQuery(
    GET_[ENTITIES]_QUERY,
    {
      variables: { args: options },
      fetchPolicy: isConnected ? 'cache-and-network' : 'cache-only',
    }
  );

  // Sync to local database
  useEffect(() => {
    if (data?.[entities]?.nodes) {
      sync[Entities]ToLocal(data.[entities].nodes);
    }
  }, [data]);

  const loadMore = useCallback(() => {
    if (!data?.[entities]?.pageInfo?.hasNextPage) return;
    fetchMore({
      variables: {
        args: { ...options, offset: data.[entities].nodes.length },
      },
    });
  }, [data, options, fetchMore]);

  return {
    [entities]: data?.[entities]?.nodes || [],
    totalCount: data?.[entities]?.totalCount || 0,
    hasMore: data?.[entities]?.pageInfo?.hasNextPage || false,
    loading,
    error,
    loadMore,
    refetch,
  };
}
```

---

## 🚀 IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Weeks 1-3)
- [ ] Project scaffolding with React Native CLI
- [ ] Configure TypeScript, ESLint, Prettier
- [ ] Set up Apollo Client with offline support
- [ ] Implement WatermelonDB schema
- [ ] Create base UI component library
- [ ] Set up navigation structure
- [ ] Implement authentication flow with biometrics

### Phase 2: Core Modules (Weeks 4-8)
- [ ] Auth module with biometric login
- [ ] CRM module with offline customer management
- [ ] Inventory module with barcode scanning
- [ ] POS module with offline transactions
- [ ] Warehouse module with picking/receiving

### Phase 3: Extended Modules (Weeks 9-12)
- [ ] Employee time tracking
- [ ] Financial management
- [ ] Supplier management
- [ ] Location management
- [ ] B2B features

### Phase 4: Polish & Optimization (Weeks 13-16)
- [ ] Push notifications
- [ ] Background sync optimization
- [ ] Performance tuning
- [ ] Battery optimization
- [ ] Data usage optimization
- [ ] Accessibility improvements
- [ ] App store preparation

---

## 📋 BEST PRACTICES CHECKLIST

### Performance
- [ ] Use FlatList/FlashList for all lists
- [ ] Implement image caching with react-native-fast-image
- [ ] Use Reanimated for animations (runs on UI thread)
- [ ] Memoize expensive computations
- [ ] Lazy load screens with React.lazy
- [ ] Implement skeleton loading states

### Offline First
- [ ] Every mutation queues locally first
- [ ] Optimistic UI updates
- [ ] Conflict resolution strategy defined
- [ ] Background sync when app regains connection
- [ ] Clear sync status indicators

### Security
- [ ] Secure storage for tokens (Keychain)
- [ ] Certificate pinning for API calls
- [ ] Jailbreak/root detection
- [ ] Session timeout handling
- [ ] Biometric authentication
- [ ] Data encryption at rest

### UX
- [ ] Haptic feedback for actions
- [ ] Loading states for all async operations
- [ ] Error states with retry options
- [ ] Pull-to-refresh everywhere
- [ ] Deep linking support
- [ ] Offline mode indicators

---

## 📄 CONCLUSION

This architecture provides a **comprehensive blueprint** for building a React Native mobile application that:

1. **Mirrors the web's 24-module structure** while adapting to mobile-first workflows
2. **Leverages native capabilities** (camera, location, biometrics, push notifications)
3. **Works offline-first** with intelligent sync
4. **Integrates seamlessly** with the NestJS/GraphQL backend
5. **Scales** from a single user to enterprise deployments

The foundation layer (`lib/`) provides all the shared infrastructure, while hooks encapsulate business logic, and screens compose the final user experience—exactly mirroring the web application's architecture but optimized for mobile.

---

**Document Version:** 1.0.0  
**Created:** January 2025  
**Maintained by:** Development Team
