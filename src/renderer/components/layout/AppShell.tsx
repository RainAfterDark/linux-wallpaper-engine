import * as React from "react"
import { cn } from "@/lib/utils"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"
import { StatusBar } from "./StatusBar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useRouterState } from "@tanstack/react-router"

interface AppShellProps {
    children: React.ReactNode
    className?: string
}

export function AppShell({ children, className }: AppShellProps) {
    const isWallpaperPage = useRouterState().location.pathname === "/"
        
    return (
        <SidebarProvider defaultOpen={false}>
            <div className="flex h-screen w-full overflow-hidden bg-background">
                <Sidebar />
                <div className="flex flex-1 flex-col overflow-hidden">
                    {isWallpaperPage && <TopBar />}
                    <main className={cn("flex-1 overflow-auto app-scrollbar", className)}>
                        {children}
                    </main>
                    <StatusBar />
                </div>
            </div>
        </SidebarProvider>
    )
}

