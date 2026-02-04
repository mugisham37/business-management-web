import React from "react"
import { Sidebar } from "@/components/Parent-Dashboard/ui/navigation/Sidebar"
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className="mx-auto max-w-screen-2xl">
            <Sidebar />
            <main className="lg:pl-72">{children}</main>
        </div>
    )
}
