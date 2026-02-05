import React from "react"
import { Sidebar } from "@/components/Dashboard/navigation/Sidebar"
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

        className={`${GeistSans.className} overflow-x-hidden overflow-y-scroll scroll-auto bg-gray-50 antialiased selection:bg-blue-100 selection:text-blue-700 dark:bg-gray-950`}
      >
        <ThemeProvider
          defaultTheme="system"
          disableTransitionOnChange
          attribute="class"
        >
          <NuqsAdapter>
            <div>{children}</div>
          </NuqsAdapter>
        </ThemeProvider>
      
