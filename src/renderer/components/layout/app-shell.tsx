import * as React from "react"
import { cn } from "@/lib/utils"
import { Sidebar } from "./side-bar"
import { TopBar } from "./top-bar"
import { StatusBar } from "./bottom-status-bar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useRouterState } from "@tanstack/react-router"
import { trpc } from "@/lib/trpc"
import { OnboardingWrapper } from "@/components/onboarding/onboarding-provider"
import { WallpaperBackground } from "@/components/wallpaper/wallpaper-background"

interface AppShellProps {
    children: React.ReactNode
    className?: string
}

export function AppShell({ children, className }: AppShellProps) {
    const isWallpaperPage = useRouterState().location.pathname === "/"
    const { data: settings } = trpc.settings.get.useQuery()

    return (
        <OnboardingWrapper>
            <SidebarProvider defaultOpen={false}>
                <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background">
                    {settings?.dynamicBackground && <WallpaperBackground />}
                    <div className="relative z-10 flex min-h-0 flex-1">
                        <Sidebar className="z-10" />
                        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                            {isWallpaperPage && <TopBar />}
                            <main className={cn("min-h-0 flex-1 overflow-auto pb-4 scrollbar-styled", className)}>
                                {children}
                            </main>
                        </div>
                    </div>
                    {settings?.showStatusBar && <StatusBar className="z-20 shrink-0" />}
                </div>
            </SidebarProvider>
        </OnboardingWrapper>
    )
}
