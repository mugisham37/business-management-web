/**
 * Root Layout
 *
 * Configures global providers:
 * - Apollo Client for GraphQL
 * - NativeWind styles
 * - Navigation theming
 * - Font loading
 * - Deep link handling
 */
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { ApolloProvider } from "@apollo/client";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { apolloClient } from "@/lib/apollo";
import { DeepLinkHandler } from "@/components/auth/DeepLinkHandler";
import "../global.css";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Custom dark theme for the app
const EnterpriseDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#3B82F6", // Blue-500
    background: "#0D0D0D",
    card: "#1F1F1F",
    text: "#FFFFFF",
    border: "#333333",
    notification: "#EF4444",
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ApolloProvider client={apolloClient}>
        <SafeAreaProvider>
          <ThemeProvider value={EnterpriseDarkTheme}>
            <DeepLinkHandler>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(crm)" options={{ headerShown: false }} />
                <Stack.Screen name="(employee)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="modal"
                  options={{ presentation: "modal", headerShown: false }}
                />
                <Stack.Screen
                  name="scanner"
                  options={{
                    presentation: "fullScreenModal",
                    headerShown: false,
                    animation: "slide_from_bottom",
                  }}
                />
              </Stack>
            </DeepLinkHandler>
          </ThemeProvider>
        </SafeAreaProvider>
      </ApolloProvider>
    </GestureHandlerRootView>
  );
}
