import { AppSidebar } from "@/components/layout/app-sidebar";
import { Navbar } from "@/components/layout/navbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardGuard } from "@/components/auth/RouteGuard";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardGuard>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <Navbar />
                    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 lg:gap-8 lg:p-8">
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </DashboardGuard>
    );
}
