import type { Step } from "onborda-rrd"
import {
    Navigation,
    Search,
    Monitor,
    Settings2,
    AlertTriangle,
    Shuffle
} from "lucide-react"

export const ONBOARDING_TOUR_ID = "welcome-tour"

export const onboardingSteps: { tour: string, steps: Step[] }[] = [
    {
        tour: ONBOARDING_TOUR_ID,
        steps: [
            // === Installed Page (/) — Steps 0-1 ===
            {
                icon: <Navigation className="size-5" />,
                title: "Navigation",
                content: (
                    <p>
                        Use the sidebar to switch between your <strong>wallpapers</strong>,{" "}
                        <strong>displays</strong>, and <strong>settings</strong>.
                    </p>
                ),
                selector: "#onboarding-sidebar-nav",
                side: "right",
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10,
            },
            {
                icon: <Search className="size-5" />,
                title: "Search & Filter",
                content: (
                    <div className="space-y-2">
                        <p>
                            Find the perfect wallpaper using search, or use the filters to
                            narrow down by:
                        </p>
                        <ul className="ml-4 list-disc text-xs text-muted-foreground">
                            <li><strong>Type</strong> (Scene, Web, Video, App)</li>
                            <li><strong>Compatibility</strong> (Verified Only)</li>
                            <li><strong>Sort</strong> (Name, Rating, etc.)</li>
                        </ul>
                        <p>
                            Click any wallpaper to see details and apply it.
                        </p>
                    </div>
                ),
                selector: "#onboarding-topbar",
                side: "bottom",
                showControls: true,
                pointerPadding: 8,
                pointerRadius: 12,
                nextRoute: "/playlists",
            },

            // === Playlists Page (/playlists) — Step 2 ===
            {
                icon: <Shuffle className="size-5" />,
                title: "Playlists",
                content: (
                    <div className="space-y-2">
                        <p>
                            Create <strong>playlists</strong> to rotate wallpapers automatically.
                            Set custom timing and shuffle modes for variety.
                        </p>
                    </div>
                ),
                selector: "#onboarding-playlists",
                side: "bottom",
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 12,
                nextRoute: "/displays",
                prevRoute: "/",
            },

            // === Displays Page (/displays) — Step 3 ===
            {
                icon: <Monitor className="size-5" />,
                title: "Manage Displays",
                content: (
                    <p>
                        View your physical monitor layout and manage per-display settings.
                    </p>
                ),
                selector: "#onboarding-display-layout",
                side: "bottom",
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 12,
                nextRoute: "/settings",
                prevRoute: "/",
            },

            // === Settings Page (/settings) — Steps 4-5 ===
            {
                icon: <Settings2 className="size-5" />,
                title: "Settings",
                content: (
                    <div className="space-y-2">
                        <p>
                            Configure your experience — <strong>performance</strong> limits,{" "}
                            <strong>audio</strong>, <strong>display</strong> defaults, and{" "}
                            <strong>appearance</strong> are all here.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            You can always come back and tweak these later.
                        </p>
                    </div>
                ),
                selector: "#onboarding-settings-page",
                side: "bottom",
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 12,
                prevRoute: "/displays",
            },
            {
                icon: <AlertTriangle className="size-5 text-warning" />,
                title: "Compatibility Scan",
                content: (
                    <div className="space-y-2">
                        <p className="font-semibold text-warning">
                            Strongly recommended!
                        </p>
                        <p>
                            Run this scan to test every wallpaper in your library. It
                            identifies which ones work perfectly on Linux and which ones
                            might have issues.
                        </p>
                    </div>
                ),
                selector: "#onboarding-compatibility-scan",
                side: "bottom",
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 12,
            },
        ],
    },
]
