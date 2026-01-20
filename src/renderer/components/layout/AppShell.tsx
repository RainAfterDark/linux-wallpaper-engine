import * as React from "react"
import { cn } from "@/lib/utils"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"
import { StatusBar } from "./StatusBar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

interface AppShellProps {
    children: React.ReactNode
    className?: string
}

export function AppShell({ children, className }: AppShellProps) {
    return (
        <SidebarProvider defaultOpen={false}>
            <div className="flex h-screen w-full overflow-hidden bg-background">
                <Sidebar />
                <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex items-center gap-2 border-b border-border">
                        <SidebarTrigger className="ml-2" />
                        <TopBar />
                    </div>
                    <main className={cn("flex-1 overflow-auto", className)}>
                        {children}
                    </main>
                    <StatusBar />
                </div>
            </div>
        </SidebarProvider>
    )
}
