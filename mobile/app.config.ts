const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getAppName = () => {
    if (IS_DEV) return "Enterprise BMS (Dev)";
    if (IS_PREVIEW) return "Enterprise BMS (Preview)";
    return "Enterprise BMS";
};

const getBundleId = () => {
    if (IS_DEV) return "com.enterprise.bms.dev";
    if (IS_PREVIEW) return "com.enterprise.bms.preview";
    return "com.enterprise.bms";
};

export default {
    name: getAppName(),
    slug: "enterprise-bms-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "enterprise-bms",
    userInterfaceStyle: "dark",
    newArchEnabled: true,
    splash: {
        image: "./assets/images/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#0D0D0D",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
        supportsTablet: true,
        bundleIdentifier: getBundleId(),
        infoPlist: {
            NSCameraUsageDescription:
                "This app uses the camera for barcode scanning and document capture.",
            NSPhotoLibraryUsageDescription:
                "This app accesses photos for product images and document attachments.",
            NSLocationWhenInUseUsageDescription:
                "This app uses your location for delivery tracking and location-based features.",
            NSFaceIDUsageDescription:
                "This app uses Face ID for secure authentication.",
        },
    },
    android: {
        adaptiveIcon: {
            foregroundImage: "./assets/images/adaptive-icon.png",
            backgroundColor: "#0D0D0D",
        },
        package: getBundleId(),
        permissions: [
            "android.permission.CAMERA",
            "android.permission.READ_EXTERNAL_STORAGE",
            "android.permission.ACCESS_FINE_LOCATION",
            "android.permission.USE_BIOMETRIC",
            "android.permission.VIBRATE",
        ],
    },
    web: {
        output: "static",
        bundler: "metro",
        favicon: "./assets/images/favicon.png",
    },
    plugins: [
        "expo-router",
        "expo-font",
        [
            "expo-camera",
            {
                cameraPermission:
                    "Allow $(PRODUCT_NAME) to access your camera for barcode scanning.",
            },
        ],
        [
            "expo-local-authentication",
            {
                faceIDPermission:
                    "Allow $(PRODUCT_NAME) to use Face ID for secure login.",
            },
        ],
        // Uncomment after installing: npm install @sentry/react-native expo-haptics --legacy-peer-deps
        // [
        //     "@sentry/react-native/expo",
        //     {
        //         organization: process.env.SENTRY_ORG,
        //         project: process.env.SENTRY_PROJECT,
        //     },
        // ],
        // "expo-haptics",
    ],
    experiments: {
        typedRoutes: true,
    },
    extra: {
        eas: {
            projectId: process.env.EAS_PROJECT_ID,
        },
        graphqlEndpoint: process.env.GRAPHQL_ENDPOINT || "http://localhost:4000/graphql",
        sentryDsn: process.env.SENTRY_DSN,
    },
};
