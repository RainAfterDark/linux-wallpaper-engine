import { Link, useRouterState } from "@tanstack/react-router"
import {
    Download,
    ListMusic,
    Monitor,
    Settings,
} from "lucide-react"
import {
    Sidebar as SidebarPrimitive,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

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
        <SidebarPrimitive collapsible="icon">
            <SidebarHeader>
                <div className="flex h-14 items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                        <Monitor className="size-4 text-white" />
                    </div>
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                        <span className="text-sm font-semibold text-sidebar-foreground">
                            Wallpaper Engine
                        </span>
                        <span className="text-xs text-muted-foreground">for Linux</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => {
                                const isActive = currentPath === item.to
                                return (
                                    <SidebarMenuItem key={item.to}>
                                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                                            <Link to={item.to}>
                                                <item.icon className="size-4" />
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="group-data-[collapsible=icon]:hidden">
                <div className="p-2">
                    <div className="text-xs text-muted-foreground">
                        <p>linux-wallpaperengine</p>
                        <p className="mt-0.5 opacity-60">v1.0.0</p>
                    </div>
                </div>
            </SidebarFooter>
        </SidebarPrimitive>
    )
}
