import { createFileRoute } from "@tanstack/react-router"
import * as React from "react"
import {
    Gauge,
    Volume2,
    Monitor,
    Palette,
    Info,
    RotateCcw,
    Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { SettingsSection } from "@/components/settings/SettingsSection"
import { SettingRow } from "@/components/settings/SettingRow"
import { trpc } from "@/lib/trpc"
import { useTheme } from "@/components/theme-provider"

export const Route = createFileRoute("/settings")({
    component: SettingsPage,
})

function SettingsPage() {
    const { data: settings, isLoading, error } = trpc.settings.get.useQuery()
    const utils = trpc.useUtils()

    const updateMutation = trpc.settings.update.useMutation({
        onSuccess: () => {
            utils.settings.get.invalidate()
        },
    })

    const resetMutation = trpc.settings.reset.useMutation({
        onSuccess: () => {
            utils.settings.get.invalidate()
        },
    })

    const { mode, setMode } = useTheme()

    const updateSetting = (key: string, value: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updateMutation.mutate({ [key]: value } as any)
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="size-8 animate-spin mb-4" />
                <p>Loading settings...</p>
            </div>
        )
    }

    if (error || !settings) {
        return (
            <div className="p-6">
                <div className="text-destructive">
                    Failed to load settings
                    {error && <p className="text-sm mt-2">{error.message}</p>}
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">
                        Configure application preferences
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resetMutation.mutate()}
                    disabled={resetMutation.isPending}
                >
                    <RotateCcw className="size-4 mr-2" />
                    Reset to Defaults
                </Button>
            </div>

            <div className="space-y-6">
                {/* Performance Section */}
                <SettingsSection
                    icon={Gauge}
                    title="Performance"
                    description="FPS limits and power management"
                >
                    <SettingRow label="Maximum FPS">
                        <select
                            value={settings.fps}
                            onChange={(e) => updateSetting("fps", Number(e.target.value))}
                            className="h-8 rounded-md border border-input bg-background px-3 text-sm"
                        >
                            <option value={30}>30 FPS</option>
                            <option value={60}>60 FPS</option>
                            <option value={120}>120 FPS</option>
                            <option value={144}>144 FPS</option>
                        </select>
                    </SettingRow>
                    <SettingRow label="Pause on fullscreen apps">
                        <Switch
                            checked={settings.pauseOnFullscreen}
                            onCheckedChange={(checked) => updateSetting("pauseOnFullscreen", checked)}
                        />
                    </SettingRow>
                </SettingsSection>

                {/* Audio Section */}
                <SettingsSection
                    icon={Volume2}
                    title="Audio"
                    description="Volume and audio processing"
                >
                    <SettingRow label="Volume">
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min={0}
                                max={100}
                                value={settings.volume}
                                onChange={(e) => updateSetting("volume", Number(e.target.value))}
                                className="w-32 accent-primary"
                            />
                            <span className="text-sm text-muted-foreground w-10">
                                {settings.volume}%
                            </span>
                        </div>
                    </SettingRow>
                    <SettingRow label="Mute audio">
                        <Switch
                            checked={settings.silent}
                            onCheckedChange={(checked) => updateSetting("silent", checked)}
                        />
                    </SettingRow>
                    <SettingRow label="Don't mute when other apps play audio">
                        <Switch
                            checked={settings.noAutomute}
                            onCheckedChange={(checked) => updateSetting("noAutomute", checked)}
                        />
                    </SettingRow>
                    <SettingRow label="Audio reactive effects">
                        <Switch
                            checked={settings.audioProcessing}
                            onCheckedChange={(checked) => updateSetting("audioProcessing", checked)}
                        />
                    </SettingRow>
                </SettingsSection>

                {/* Display Section */}
                <SettingsSection
                    icon={Monitor}
                    title="Display"
                    description="Default display behavior"
                >
                    <SettingRow label="Default scaling">
                        <select
                            value={settings.defaultScaling}
                            onChange={(e) => updateSetting("defaultScaling", e.target.value as typeof settings.defaultScaling)}
                            className="h-8 rounded-md border border-input bg-background px-3 text-sm"
                        >
                            <option value="default">Default</option>
                            <option value="fill">Fill</option>
                            <option value="fit">Fit</option>
                            <option value="stretch">Stretch</option>
                        </select>
                    </SettingRow>
                    <SettingRow label="Disable mouse interaction">
                        <Switch
                            checked={settings.disableMouse}
                            onCheckedChange={(checked) => updateSetting("disableMouse", checked)}
                        />
                    </SettingRow>
                    <SettingRow label="Disable parallax effect">
                        <Switch
                            checked={settings.disableParallax}
                            onCheckedChange={(checked) => updateSetting("disableParallax", checked)}
                        />
                    </SettingRow>
                </SettingsSection>

                {/* Appearance Section */}
                <SettingsSection
                    icon={Palette}
                    title="Appearance"
                    description="Theme and visual preferences"
                >
                    <SettingRow label="Theme">
                        <select
                            value={mode}
                            onChange={(e) => {
                                const newMode = e.target.value as "light" | "dark" | "system"
                                setMode(newMode)
                                updateSetting("theme", newMode)
                            }}
                            className="h-8 rounded-md border border-input bg-background px-3 text-sm"
                        >
                            <option value="system">System</option>
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </SettingRow>
                </SettingsSection>

                {/* About Section */}
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
                    </div>
                </div>
            </div>
        </div>
    )
}
