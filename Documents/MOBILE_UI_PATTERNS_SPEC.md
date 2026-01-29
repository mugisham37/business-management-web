# 📱 DETAILED UI PATTERNS & IMPLEMENTATION SPECIFICATIONS

## Enterprise Business Management System - Visual & Interaction Design Guide

**Version:** 1.0.0  
**Companion To:** MOBILE_INSPIRATION_ANALYSIS.md  
**Purpose:** Detailed breakdown of UI patterns, component specifications, and screen-by-screen design guidance

---

## TABLE OF CONTENTS

1. [UI Pattern Library from Inspiration](#ui-pattern-library-from-inspiration)
2. [Screen State Management Patterns](#screen-state-management-patterns)
3. [Form Design Specifications](#form-design-specifications)
4. [Modal and Bottom Sheet Patterns](#modal-and-bottom-sheet-patterns)
5. [List and Grid Patterns](#list-and-grid-patterns)
6. [Action Bar Patterns](#action-bar-patterns)
7. [Dashboard Widget Specifications](#dashboard-widget-specifications)
8. [Barcode and Camera Integration Patterns](#barcode-and-camera-integration-patterns)
9. [Offline UI Patterns](#offline-ui-patterns)
10. [Role-Specific Screen Variations](#role-specific-screen-variations)
11. [Animation and Micro-Interaction Specifications](#animation-and-micro-interaction-specifications)
12. [Accessibility Implementation Guide](#accessibility-implementation-guide)

---

## 🎨 UI PATTERN LIBRARY FROM INSPIRATION

### Pattern 1: The SafeScreen Wrapper

**What It Is**: Every screen in the inspiration project wraps its content in a SafeScreen component. This component applies safe area insets, ensuring content doesn't overlap with the device's notch, status bar, or home indicator.

**Implementation Details**: The SafeScreen uses useSafeAreaInsets from react-native-safe-area-context. It applies paddingTop equal to insets.top. The background color is set to the theme's background (dark mode #121212).

**Why This Matters**: Without SafeScreen, content would render under the status bar on notched devices (iPhone X and later) and be partially hidden. It ensures a consistent, professional look across all device types.

**Our Adaptation**: We will create an enhanced version called AppScreen that additionally handles offline status (showing a banner when offline), includes a loading overlay for screen-level loading states, and supports an optional header configuration.

### Pattern 2: The Floating Tab Bar

**What It Is**: The inspiration project's tab bar is not a standard solid bar. Instead, it floats above the content with margins, has a blur background, and uses rounded corners.

**Implementation Details**: The tab bar position is set to absolute. It uses horizontal margins of 100 to center a compact bar. The background is transparent, with a BlurView child providing the frosted glass effect. The intensity is 80 with a dark tint. Border radius of 24 creates the pill shape.

**Why This Matters**: This design elevates the tab bar from a utilitarian navigation element to a premium, modern UI element. It allows content to peek through via the blur, creating depth.

**Our Adaptation**: We will keep the blur effect but reduce horizontal margins since our business app may need more tabs. We will implement conditional tab icons based on user role. We will add a badge capability for notification counts (for example, pending approvals count on a manager's tab).

### Pattern 3: The Card-Based Layout

**What It Is**: Nearly all content in the inspiration project is presented in cards. Product grids, cart items, order lists, addresses, and settings all use the same card styling approach.

**Implementation Details**: Cards use the surface color (#282828) as background. Border radius is 24px (rounded-3xl) for outer cards. Internal padding is 16-20px. Cards have no explicit border or shadow since the color contrast creates separation.

**Why This Matters**: Cards create visual grouping, making complex data easier to scan. Consistent card styling creates visual harmony across the app.

**Our Adaptation**: We will adopt this exact pattern. We may add very subtle shadows (opacity 0.05-0.1) for additional depth. We will create card variants: basic card, tappable card with active opacity, and swipeable card for actions.

### Pattern 4: The Menu Grid

**What It Is**: The profile screen uses a two-column grid of menu items, each with an icon in a colored circular background, with a label below.

**Implementation Details**: Items are wrapped in TouchableOpacity with width set to 48%. FlexRow with flexWrap creates the grid. Each item has a colored icon container (bg-blue-500/20 with blue-500 icon). The layout is centered with justify-center.

**Why This Matters**: This pattern provides quick access to multiple features in a glanceable format. It's more visual than a list and better for primary navigation options.

**Our Adaptation**: We will use this for profile menu and module quick-access screens. Each module can have an icon and color assigned. We may use this pattern for the "More" tab that provides access to less-frequently-used modules.

### Pattern 5: The Settings Item Row

**What It Is**: The privacy and security screen uses a list of setting items, each with an icon, title, description, and either a toggle switch or navigation chevron.

**Implementation Details**: Each row is a card with flexRow layout. Icon container on the left (48x48 with 24px border radius). Text column (flex-1) in the middle with title and description. Action element on the right (Switch or Ionicons chevron-forward).

**Why This Matters**: This is the standard pattern for settings across iOS and Android. Users instinctively understand toggle versus navigation.

**Our Adaptation**: Direct adoption for all settings screens. We will add support for value display (for example, "English" next to Language setting), for warning states (red accent for dangerous settings), and for disabled states with explanatory text.

### Pattern 6: The Header with Back Button

**What It Is**: Screens that are pushed onto a stack (not tabs) have a consistent header with a back button and title.

**Implementation Details**: Horizontal padding of 24px, vertical padding bottom of 20px. Border-bottom with surface color creates visual separation. FlexRow with alignItems center. TouchableOpacity with arrow-back icon on left. Title text (text-2xl font-bold) next to/after back button.

**Why This Matters**: Consistent headers help users understand navigation context. The back button is always in the same predictable location.

**Our Adaptation**: We will create a reusable Header component with props for title, showBackButton, rightActions, and onBackPress. Right actions array supports icons and buttons on the right side.

---

## 📊 SCREEN STATE MANAGEMENT PATTERNS

### Pattern: The Three UI States

Every screen that fetches data must handle three states: loading, error, and empty. The inspiration project demonstrates this consistently.

**Loading State Pattern**: A centered container with ActivityIndicator and a text label below explaining what's loading. The indicator uses the accent color. Text is semantic, like "Loading cart..." or "Loading products...".

**Error State Pattern**: A centered container with a large icon (alert-circle-outline), a primary error heading, and a secondary explanatory text. The icon is red. The text explains the error and provides guidance, like "Please check your connection and try again."

**Empty State Pattern**: Similar layout to error but with a contextual icon (for empty cart, use cart-outline; for empty wishlist, use heart-outline). Heading states what's empty ("Your cart is empty"). Description provides next steps ("Add some products to get started."). Often includes a primary action button.

**Implementation Observation**: In the inspiration project, these are defined as inline functions within each screen file (LoadingUI, ErrorUI, EmptyUI). For our larger app, we should extract these as shared components.

**Our Adaptation**: Create three shared components in a components/states directory. LoadingState accepting message prop. ErrorState accepting title, message, and optional retry callback. EmptyState accepting icon, title, message, and optional action button with label and onPress.

### Pattern: Conditional Rendering Flow

The inspiration project uses a consistent pattern for conditional rendering:

```
if (isLoading) return <LoadingUI />;
if (isError) return <ErrorUI />;
if (data.length === 0) return <EmptyUI />;

// Main content
return (...);
```

**Why This Matters**: This pattern short-circuits rendering early. The happy path (data loaded, has items) is the default return. Loading is always checked first, then error, then empty.

**Our Adaptation**: Adopt this exact pattern. Consider creating a DataStateHandler component that takes loading, error, empty, and renderContent props to reduce repetition.

### Pattern: Inline Loading for Mutations

When a mutation is in progress, buttons show inline loading. The inspiration project demonstrates this with ActivityIndicator inside the button, replacing the text.

**Implementation Details**: The button has a disabled prop that is true when the mutation isPending. The button content uses a ternary: if pending, show ActivityIndicator; otherwise, show text/icon.

**Our Adaptation**: Create a reusable Button component that has a loading prop. When loading is true, the button shows a spinner, disables itself, and optionally shows a loading label.

---

## 📝 FORM DESIGN SPECIFICATIONS

### Pattern: Text Input Styling

**From Inspiration**: The address form modal demonstrates the input pattern. Inputs use the surface background color. Rounded corners at 16px (rounded-2xl). Horizontal padding of 16px, vertical padding of 16px. Text color is primary (white), placeholder color is muted (#666).

**Label Pattern**: Labels are separate Text elements above the input. Text uses primary color, font-bold or font-semibold. Margin bottom of 8px separates label from input.

**Section Pattern**: Each form section (one label + one input) has margin bottom of 20px to create breathing room.

**Our Adaptation**: Create a FormField component that bundles label and input. Props include label text, placeholder, value, onChangeText, keyboardType, multiline, and error. When error is present, show red border and error message below input.

### Pattern: Switch Input

**From Inspiration**: The default address toggle and privacy settings demonstrate switch inputs. The Switch component uses custom trackColor (inactive #2A2A2A, active primary color). Thumb color is always white.

**Layout Pattern**: Row layout with text on left (flex-1) and switch on right. Often wrapped in a card container for visual grouping.

**Our Adaptation**: Create a FormSwitch component. Props include label, description (optional), value, and onValueChange. Wrapper handles the card background and layout.

### Pattern: Form Modal Layout

**From Inspiration**: AddressFormModal follows a consistent layout. KeyboardAvoidingView wraps everything for iOS keyboard handling. SafeScreen provides safe area padding. Header has title and close button. ScrollView with padding contains the form fields. The save button is within the scroll view (not sticky).

**Behavior Pattern**: Modal is presented with slide animation. Modal has transparent background on the outside. Content fills full screen with background color.

**Our Adaptation**: We should create a FormModal container component. Props include visible, title, onClose, onSubmit, submitLabel, isSubmitting. It handles the wrapper structure; children receive the form fields.

### Pattern: Form Validation

**Observable Pattern**: The inspiration checks form validity on submit. Alert.alert shows validation errors ("Please fill in all fields"). No inline validation messages appear.

**Our Adaptation**: Enhance with inline validation. Show errors below fields. Disable submit until form is valid. Provide real-time feedback, especially for important fields.

---

## 📦 MODAL AND BOTTOM SHEET PATTERNS

### Pattern: Full-Screen Modal

**From Inspiration**: AddressFormModal and RatingModal demonstrate full-screen modals. Modal visible prop controls display. Animation type is "slide" (slides up from bottom). Transparent prop allows the outside to be seen during animation.

**Content Structure**: SafeScreen wrapper inside. Header with title and close button. Content in ScrollView. Footer (if any) positioned at bottom or in scroll.

**Close Behavior**: X button or close icon in header. onRequestClose handles Android back button. TouchableWithoutFeedback outside content area (for transparent modals like RatingModal).

**Our Adaptation**: Create two modal types. FormModal for editing content (full-screen slide). ConfirmModal for simple confirmations (fade animation, centered content).

### Pattern: Bottom Sheet

**Observed Gap**: The inspiration doesn't use bottom sheets, but they're essential for our app. We should implement them for quick selections, filter menus, and action menus.

**Recommended Pattern**: Use a library like react-native-bottom-sheet. Snap points at 25%, 50%, and 90% of screen height. Include handle at top for dragging. Content scrolls within the sheet. Backdrop dims background and allows tap to close.

**Use Cases for Our App**: Product quick view in POS (tap product, see details without leaving list). Filter selections (category, date range, status filters). Action menus (long press on list item for contextual actions). Payment method selection.

---

## 📋 LIST AND GRID PATTERNS

### Pattern: FlatList Configuration

**From Inspiration**: ProductsGrid uses FlatList with specific configuration. numColumns is 2 for grid layout. columnWrapperStyle with justifyContent space-between for even spacing. showsVerticalScrollIndicator is false for cleaner look. scrollEnabled is false when nested in a parent ScrollView.

**Why scrollEnabled False**: When a FlatList is nested inside a ScrollView, scroll conflicts occur. Setting scrollEnabled to false while putting the FlatList inside ScrollView allows the outer scroll to control scrolling while still using FlatList's optimization.

**Our Adaptation**: Use this exact pattern for product grids, customer grids, and entity grids. For long lists that aren't nested, use scrollEnabled true and remove parent ScrollView.

### Pattern: List Item Cards

**From Inspiration**: Cart items, order items, wishlist items all use a card per item. Image on the left (fixed size, rounded). Text content in the middle (flex-1). Actions on the right.

**Action Patterns**: Quantity adjusters with minus and plus buttons. Delete button (trash icon) with red tint. The entire card is tappable to navigate to detail.

**Our Adaptation**: Create base ListItemCard component. Slots for left (image), center (content), and right (actions). Specific item types (OrderItemCard, ProductItemCard) extend this pattern.

### Pattern: Empty List

**From Inspiration**: Every list has a ListEmptyComponent. Centered vertically, icon at top, heading, descriptive text, optional action button.

**Our Adaptation**: Use the EmptyState component for all empty lists. Customize icon and text per context.

---

## 🎬 ACTION BAR PATTERNS

### Pattern: Sticky Bottom Action Bar

**From Inspiration**: Cart screen has a sticky bottom bar that stays visible during scroll. Contains summary info and checkout button. Uses absolute positioning (bottom 0, left 0, right 0). Background with backdrop blur. Top border for visual separation. Padding bottom accounts for safe area and tab bar.

**Content Pattern**: Upper section has quick stats (item count, total). Lower section has the primary action button (full-width, large padding).

**Our Adaptation**: Create BottomActionBar component. Props for children content. Handles positioning, blur background, and safe area padding. Use for checkout, save form, and submit actions.

### Pattern: Floating Action Header

**From Inspiration**: Product detail has a floating header over the image. Absolute positioned at top. Semi-transparent background (black/50) on buttons. Left button is back. Right button is wishlist toggle.

**Our Adaptation**: Create FloatingHeader component for immersive screens (product detail, profile header with cover image). Props for leftAction, rightActions, and transparent flag.

---

## 📊 DASHBOARD WIDGET SPECIFICATIONS

### Widget Type 1: KPI Card

**Purpose**: Show a single important metric prominently.

**Layout Specification**: Card container with padding 20px. Metric label text (text-secondary, text-sm) at top. Large metric number (text-3xl, font-bold, text-primary) in middle. Optional trend indicator (up arrow green, down arrow red) with percentage. Optional comparison text (vs yesterday, vs last week).

**Tap Behavior**: Tapping navigates to the relevant module or detail screen.

**Size Options**: Half-width (two per row) for secondary KPIs. Full-width for primary KPI of the day.

### Widget Type 2: Trend Chart

**Purpose**: Show metric changes over time in a compact visualization.

**Layout Specification**: Card container with title text. Chart area (react-native-chart-kit or react-native-svg-charts). Time period selector (today, week, month tabs). Legend if multiple data series.

**Chart Types**: Line chart for continuous data (sales over time). Bar chart for categorical comparison (sales by product). Donut chart for proportion (payment methods breakdown).

**Touch Behavior**: Tapping chart area can drill into full Analytics module.

### Widget Type 3: Alert Stack

**Purpose**: Show items requiring attention.

**Layout Specification**: Card container with header (title and badge count). List of 3-5 alert items max. Each item has icon, description, and timestamp. "View All" link at bottom.

**Alert Types**: Low stock warnings. Pending approvals. Overdue tasks. System notifications.

**Tap Behavior**: Tapping an alert goes to the relevant item. View All goes to full alerts list.

### Widget Type 4: Quick Actions Grid

**Purpose**: Provide one-tap access to frequent actions.

**Layout Specification**: Grid of 4 action buttons (2x2). Each button has icon (48x48 container) and label. All buttons same size for balance.

**Common Actions**: New Sale, Add Product, Clock In, View Reports. Actions should be role-appropriate.

### Widget Type 5: Recent Activity Feed

**Purpose**: Show chronological feed of relevant events.

**Layout Specification**: Card with scrollable list (max height, internal scroll). Each item has timestamp, actor avatar, action description. Items styled consistently regardless of type.

**Activity Types**: Sales completed, stock adjustments, clock in/out, approvals given, notes added.

**Tap Behavior**: Tapping activity item navigates to the referenced entity.

---

## 📸 BARCODE AND CAMERA INTEGRATION PATTERNS

### Scanner Screen Pattern

**Purpose**: Full-screen camera view for scanning barcodes, QR codes, or documents.

**Layout Specification**: Full-screen camera preview. Semi-transparent overlay with cutout for scan area. Guidance text above cutout (Scan barcode or Point camera at barcode). Torch toggle button. Close/cancel button in corner.

**Behavior Pattern**: On successful scan, provide haptic feedback. Flash the overlay or border green. Automatically process the detected code. Either close the scanner or allow continuous scanning.

**Integration Points**: POS product addition (scan to add product). Inventory receiving (scan items being received). Transfer verification (scan items being transferred). Asset tracking (scan asset tags).

### Photo Capture Pattern

**Purpose**: Capture photos for receipts, damage documentation, or profile images.

**Layout Specification**: Camera preview with capture button. Switch camera button. Flash toggle. Preview of captured image before confirming.

**Behavior Pattern**: Capture shows preview with Retake and Use buttons. Using the photo saves to local storage first, then uploads to server. Show upload progress indicator.

**Integration Points**: Expense receipt capture, damage documentation, employee photos, product images.

### Document Scan Pattern

**Purpose**: Capture multi-page documents with edge detection.

**Layout Specification**: Camera with edge detection overlay. Automatic capture when edges detected. Page counter. Finish button.

**Behavior Pattern**: Each captured page is added to stack. Can reorder or delete pages. Finish combines into PDF. Upload to server with progress.

**Integration Points**: Invoice scanning, contract scanning, ID verification documents.

---

## 🌐 OFFLINE UI PATTERNS

### Pattern: Offline Banner

**Purpose**: Inform users of connectivity status.

**Location**: Below header or at top of SafeScreen.

**Appearance**: Full-width bar with icon (cloud-offline-outline), text (You are offline), and optionally retry button. Background is muted warning color.

**Behavior**: Appears when offline, auto-dismisses when online. Can animate slide-down appearance.

### Pattern: Sync Status Indicator

**Purpose**: Show pending sync items.

**Location**: In header or dashboard widget.

**Appearance**: Cloud icon with number badge. Or text like "3 changes pending sync".

**Behavior**: Tapping shows pending changes queue. Auto-syncs when online. Shows progress during sync.

### Pattern: Stale Data Indicator

**Purpose**: Warn that displayed data may be outdated.

**Location**: Below list or on header.

**Appearance**: Text with timestamp: "Last synced 2 hours ago" with warning color if old.

**Behavior**: Tapping attempts refresh. Only shown when data is older than threshold.

### Pattern: Optimistic Update Visual

**Purpose**: Show user their action was recorded locally.

**Appearance**: Different styling for unsynced items in lists. Indicator icon or opacity change. Tooltip or badge showing "Not yet synced".

**Behavior**: Returns to normal styling after sync completes.

---

## 👥 ROLE-SPECIFIC SCREEN VARIATIONS

### Concept: Adaptive UI

Different roles see different screens or different content on the same screens. This is beyond just hiding navigation; it's about presenting appropriate information density and features.

### Cashier Role

**Tab Configuration**: POS, History, Profile.
**Dashboard (if shown)**: Today's sales total, transaction count, personal performance. No team data.
**Feature Access**: Cannot edit products, cannot view financials, cannot manage employees.

### Warehouse Worker Role

**Tab Configuration**: Tasks, Inventory, Transfers, Profile.
**Dashboard (if shown)**: Today's tasks count, pending picks, receiving queue. No financial data.
**Feature Access**: Can adjust stock, can complete transfers, cannot create POs, cannot approve anything.

### Store Manager Role

**Tab Configuration**: Dashboard, POS, Team, Reports, More.
**Dashboard**: Full KPIs for location, alerts, team status. Approvals queue.
**Feature Access**: All features for their location. Can approve timesheets, can view reports, cannot access multi-location.

### Administrator Role

**Tab Configuration**: Dashboard, Analytics, Settings, More.
**Dashboard**: System-wide KPIs, all locations comparison, system alerts.
**Feature Access**: Everything. Can configure system, manage users, view all data.

### Implementation Pattern

All screens should check user role and permissions before rendering sensitive elements. Create a usePermissions hook that returns feature flags. Wrap conditional UI in permission checks. Same screen can conditionally hide sections or simplify interfaces.

---

## 🎭 ANIMATION AND MICRO-INTERACTION SPECIFICATIONS

### Navigation Transitions

**Push Animation**: Standard iOS-style slide from right. Content slides left as new screen slides in from right.
**Modal Animation**: Slide up from bottom. Background dims to dark overlay.
**Tab Switch**: No horizontal slide (instant switch). Consider subtle fade for polish.

### List Interactions

**Item Appear**: Stagger fade-in for list items as they enter viewport. Slight scale animation from 0.95 to 1.
**Item Delete**: Slide left as item is removed. Remaining items shift up smoothly.
**Pull to Refresh**: Spinner appears at top, subtle bounce when release triggers refresh.

### Button Interactions

**Press Feedback**: Scale down slightly on press (0.97 scale). Opacity reduction (activeOpacity 0.7-0.8).
**Loading State**: Smooth transition from button text to spinner. Button doesn't resize.
**Success State**: Consider brief green checkmark animation before returning to default.

### Haptic Feedback Points

**Button Press**: Light impact on tap.
**Scan Success**: Medium impact when barcode detected.
**Error**: Error pattern (double light impact).
**Success**: Success pattern (notificationSuccess type).

### Implementation Library

Use react-native-reanimated for smooth animations. Use expo-haptics for tactile feedback. Consider shared element transitions for list-to-detail navigation.

---

## ♿ ACCESSIBILITY IMPLEMENTATION GUIDE

### Text Accessibility

**Minimum Font Size**: Body text no smaller than 14px. Labels no smaller than 12px.
**Dynamic Type Support**: Use scaled fonts that respond to device font size settings.
**Contrast Ratios**: Primary text on background must meet WCAG AA (4.5:1). Secondary text should meet 3:1 minimum.

### Interactive Element Accessibility

**Touch Targets**: Minimum 44x44 points for all buttons and touchables.
**Accessibility Labels**: All TouchableOpacity elements need accessibilityLabel. Describe action, not element (for example, "Add to cart" not "Plus button").
**Accessibility Hints**: Use accessibilityHint for non-obvious buttons (for example, "Double tap to add this product to your cart").

### Screen Reader Support

**Accessibility Role**: Set accessibilityRole appropriately (button, link, header, image).
**Heading Levels**: Mark section headers with accessibilityRole="header".
**Lists**: Group list items with proper role and state announcements.
**Forms**: Label inputs with accessibilityLabel matching visual label.

### Testing Recommendations

**VoiceOver Testing**: Every screen should be navigable with VoiceOver on iOS.
**TalkBack Testing**: Verify with TalkBack on Android.
**Large Text Testing**: Test with maximum system font size enabled.
**Reduced Motion**: Respect system preference for reduced motion.

---

## 📄 COMPONENT SPECIFICATIONS SUMMARY

### Core Components to Build

**Wrappers**: SafeScreen, AppScreen, AuthenticatedScreen.

**Layout**: Header, SectionHeader, Card, Divider, BottomActionBar.

**Forms**: FormField, FormSelect, FormSwitch, FormDatePicker, FormAmountInput, FormModal.

**Lists**: DataList, DataGrid, ListItemCard, SwipeableRow.

**State**: LoadingState, ErrorState, EmptyState, OfflineBanner.

**Feedback**: Toast, ConfirmDialog, Button (with loading state).

**Navigation**: FloatingHeader, TabBarBadge.

**Dashboard**: KPICard, TrendChart, AlertStack, QuickActionsGrid, ActivityFeed.

**Camera**: ScannerScreen, PhotoCapture, DocumentScanner.

**Business**: ProductCard, CustomerCard, OrderCard, TransactionCard, EmployeeCard, etc.

Each component should be documented with props, usage examples, and accessibility notes.

---

## 🎯 IMPLEMENTATION PRIORITY

### Week 1 Components
- SafeScreen
- Header
- Button
- LoadingState, ErrorState, EmptyState
- Card
- FormField

### Week 2 Components
- DataList, DataGrid
- ListItemCard
- FormModal
- BottomActionBar
- Toast

### Week 3 Components
- Dashboard widgets (KPICard, TrendChart)
- OfflineBanner
- ScannerScreen

### Week 4 Components
- Business-specific cards
- Remaining form components
- Advanced components (SwipeableRow, etc.)

---

**Document Version:** 1.0.0  
**Created:** January 2025  
**Purpose:** Companion design specification for MOBILE_INSPIRATION_ANALYSIS.md
