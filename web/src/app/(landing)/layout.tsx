import { Navigation } from "@/components/landing/ui/Navbar"
import Footer from "@/components/landing/ui/Footer"
import { ThemeProvider } from "next-themes"

export default function LandingLayout({
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
                <Footer />
            </div>
        </ThemeProvider>
    )
}
