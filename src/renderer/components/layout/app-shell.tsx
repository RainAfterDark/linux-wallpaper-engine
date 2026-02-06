import * as React from "react"
import { cn } from "@/lib/utils"
import { Sidebar } from "./side-bar"
import { TopBar } from "./top-bar"
import { StatusBar } from "./bottom-status-bar"
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
                <Sidebar className="z-10" />
                <div className="flex flex-1 flex-col overflow-hidden">
                    {isWallpaperPage && <TopBar />}
                    <main className={cn("flex-1 overflow-auto scrollbar-thin scrollbar-track-sidebar scrollbar-thumb-border", className)}>
                        {children}
                    </main>
                    <StatusBar className="absolute bottom-0 left-0 right-0 z-30" />
                </div>
            </div>
        </SidebarProvider>
    )
}

