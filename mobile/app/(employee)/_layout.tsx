/**
 * Employee Route Group Layout
 *
 * Layout for employee management screens.
 */
import { Stack } from "expo-router";

export default function EmployeeLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#0D0D0D" },
                animation: "slide_from_right",
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="time-clock" />
            <Stack.Screen name="schedule" />
            <Stack.Screen name="[id]" />
        </Stack>
    );
}
