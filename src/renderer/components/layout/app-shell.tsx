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
            <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
                <div className="flex min-h-0 flex-1">
                    <Sidebar className="z-10" />
                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                        {isWallpaperPage && <TopBar />}
                        <main className={cn("min-h-0 flex-1 overflow-auto pb-4 scrollbar-thin scrollbar-track-sidebar scrollbar-thumb-border", className)}>
                            {children}
                        </main>
                    </div>
                </div>
                <StatusBar className="z-20 shrink-0" />
            </div>
        </SidebarProvider>
    )
}

