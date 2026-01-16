import { Link, useRouterState } from "@tanstack/react-router"
import {
    Download,
    ListMusic,
    Monitor,
    Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { to: "/", icon: Download, label: "Installed" },
    { to: "/playlists", icon: ListMusic, label: "Playlists" },
    { to: "/displays", icon: Monitor, label: "Displays" },
    { to: "/settings", icon: Settings, label: "Settings" },
] as const

export function Sidebar() {
    const router = useRouterState()
    const currentPath = router.location.pathname

    return (
        <aside className="flex w-56 flex-col border-r border-sidebar-border bg-sidebar">
            <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
                <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                    <Monitor className="size-4 text-white" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-sidebar-foreground">
                        Wallpaper Engine
                    </span>
                    <span className="text-xs text-muted-foreground">for Linux</span>
                </div>
            </div>

            <nav className="flex-1 space-y-1 p-2">
                {navItems.map((item) => {
                    const isActive = currentPath === item.to
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                            )}
                        >
                            <item.icon className="size-4" />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="border-t border-sidebar-border p-4">
                <div className="text-xs text-muted-foreground">
                    <p>linux-wallpaperengine</p>
                    <p className="mt-0.5 opacity-60">v1.0.0</p>
                </div>
            </div>
        </aside>
    )
}
