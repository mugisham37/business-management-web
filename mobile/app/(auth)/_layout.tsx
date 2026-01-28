/**
 * Auth Route Group Layout
 *
 * Layout for authentication screens (login, register, forgot password).
 */
import { Stack } from "expo-router";

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#0D0D0D" },
                animation: "slide_from_right",
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
        </Stack>
    );
}
