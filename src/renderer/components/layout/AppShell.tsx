import * as React from "react"
import { cn } from "@/lib/utils"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"
import { StatusBar } from "./StatusBar"

interface AppShellProps {
    children: React.ReactNode
    className?: string
}

export function AppShell({ children, className }: AppShellProps) {
    return (
        <div className="flex h-screen flex-col overflow-hidden bg-background">
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <div className="flex flex-1 flex-col overflow-hidden">
                    <TopBar />
                    <main className={cn("flex-1 overflow-auto", className)}>
                        {children}
                    </main>
                </div>
            </div>
            <StatusBar />
        </div>
    )
}
