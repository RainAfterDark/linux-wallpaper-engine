import { Link, useRouterState } from "@tanstack/react-router"
import {
    Download,
    ListMusic,
    Monitor,
    Settings,
} from "lucide-react"
import logoImage from "../../../../assests/transperent-logo.png"
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
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const navItems = [
    { to: "/", icon: Download, label: "Installed" },
    // { to: "/playlists", icon: ListMusic, label: "Playlists" },
    { to: "/displays", icon: Monitor, label: "Displays" },
    { to: "/settings", icon: Settings, label: "Settings" },
] as const

interface SidebarProps {
    className?: string
}

export function Sidebar({ className }: SidebarProps) {
    const router = useRouterState()
    const currentPath = router.location.pathname

    return (
        <SidebarPrimitive collapsible="icon" className={cn("", className)}>
            <SidebarHeader>
                <div className="flex h-14 -mt-[10px] items-center gap-3 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                    <div className="flex items-center justify-center shrink-0 rounded-md p-1">
                        <img
                            src={logoImage}
                            alt="Wallpaper Engine Logo"
                            className="size-7 object-contain"
                        />
                    </div>
                </div>
                <Separator className="-mt-[7.511px] w-full p-0" />
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
            {/* <SidebarRail /> */}
        </SidebarPrimitive>
    )
}
