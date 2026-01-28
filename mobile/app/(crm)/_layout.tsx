/**
 * CRM Route Group Layout
 *
 * Layout for customer relationship management screens.
 */
import { Stack } from "expo-router";

export default function CRMLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#0D0D0D" },
                animation: "slide_from_right",
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="[id]" />
            <Stack.Screen name="new" options={{ presentation: "modal" }} />
        </Stack>
    );
}
