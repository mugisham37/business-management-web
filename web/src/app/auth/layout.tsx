import { Navigation } from "@/components/landing/ui/Navbar"
import { ThemeProvider } from "next-themes"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            disableTransitionOnChange
        >
            <div className="min-h-screen bg-white dark:bg-gray-950">
                <Navigation />
                {children}
            </div>
        </ThemeProvider>
    )
}