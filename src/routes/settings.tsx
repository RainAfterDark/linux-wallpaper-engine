import { createFileRoute } from "@tanstack/react-router"
import {
    Gauge,
    Volume2,
    FolderOpen,
    Monitor,
    Rocket,
    Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/settings")({
    component: SettingsPage,
})

const settingsSections = [
    {
        id: "performance",
        icon: Gauge,
        title: "Performance",
        description: "FPS limits and power management",
        settings: [
            { label: "Maximum FPS", value: "60", type: "select" },
            { label: "Pause on fullscreen", value: true, type: "switch" },
            { label: "Pause on battery", value: true, type: "switch" },
        ],
    },
    {
        id: "audio",
        icon: Volume2,
        title: "Audio",
        description: "Volume and audio processing",
        settings: [
            { label: "Master Volume", value: "80%", type: "slider" },
            { label: "Mute on start", value: false, type: "switch" },
            { label: "Audio visualization", value: true, type: "switch" },
        ],
    },
    {
        id: "paths",
        icon: FolderOpen,
        title: "Paths",
        description: "Steam and asset locations",
        settings: [
            {
                label: "Steam Directory",
                value: "~/.steam/steam",
                type: "path",
            },
            {
                label: "Assets Directory",
                value: "Auto-detected",
                type: "path",
            },
        ],
    },
    {
        id: "display",
        icon: Monitor,
        title: "Display",
        description: "Default display behavior",
        settings: [
            { label: "Default Scaling", value: "Fill", type: "select" },
            { label: "Multi-monitor mode", value: "Independent", type: "select" },
        ],
    },
    {
        id: "startup",
        icon: Rocket,
        title: "Startup",
        description: "Application startup behavior",
        settings: [
            { label: "Launch on login", value: false, type: "switch" },
            { label: "Start minimized", value: true, type: "switch" },
            { label: "Restore last wallpaper", value: true, type: "switch" },
        ],
    },
]

function SettingsPage() {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted-foreground">
                    Configure application preferences
                </p>
            </div>

            <div className="space-y-6">
                {settingsSections.map((section) => (
                    <div
                        key={section.id}
                        className="rounded-xl border border-border bg-card"
                    >
                        <div className="flex items-center gap-3 border-b border-border p-4">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                                <section.icon className="size-4 text-muted-foreground" />
                            </div>
                            <div>
                                <h2 className="font-semibold">{section.title}</h2>
                                <p className="text-sm text-muted-foreground">
                                    {section.description}
                                </p>
                            </div>
                        </div>

                        <div className="divide-y divide-border">
                            {section.settings.map((setting, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between px-4 py-3"
                                >
                                    <span className="text-sm">{setting.label}</span>
                                    <div className="flex items-center gap-2">
                                        {setting.type === "switch" ? (
                                            <button
                                                className={`relative h-5 w-9 rounded-full transition-colors ${setting.value ? "bg-primary" : "bg-secondary"
                                                    }`}
                                            >
                                                <span
                                                    className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-all ${setting.value ? "left-4" : "left-0.5"
                                                        }`}
                                                />
                                            </button>
                                        ) : setting.type === "path" ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">
                                                    {setting.value}
                                                </span>
                                                <Button variant="outline" size="sm">
                                                    Browse
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                {setting.value}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                            <Info className="size-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                            <h2 className="font-semibold">About</h2>
                            <p className="text-sm text-muted-foreground">
                                Linux Wallpaper Engine UI v1.0.0
                            </p>
                        </div>
                        <Button variant="outline" size="sm">
                            Check for Updates
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
