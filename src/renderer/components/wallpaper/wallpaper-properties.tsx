import * as React from "react"
import { ChevronDown, RotateCcw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { SettingRow } from "@/components/settings/setting-row"
import { type Wallpaper } from "./wallpaper-card"
import { trpc } from "@/lib/trpc"

interface WallpaperPropertiesProps {
    wallpaper: Wallpaper
}

export function WallpaperProperties({ wallpaper }: WallpaperPropertiesProps) {
    const [isExpanded, setIsExpanded] = React.useState(true)
    const [localProperties, setLocalProperties] = React.useState<Record<string, string | number | boolean>>({})
    const utils = trpc.useUtils()

    // Fetch available properties from linux-wallpaperengine
    const { data: fetchedProperties, isLoading } = trpc.wallpaper.getProperties.useQuery(
        { path: wallpaper.path ?? "" },
        { enabled: Boolean(wallpaper.path) }
    )

    // Fetch saved custom properties for this wallpaper
    const { data: savedProperties } = trpc.wallpaper.getSavedProperties.useQuery(
        { path: wallpaper.path ?? "" },
        { enabled: Boolean(wallpaper.path) }
    )

    const saveMutation = trpc.wallpaper.saveProperties.useMutation({
        onSuccess: () => {
            utils.wallpaper.getSavedProperties.invalidate({ path: wallpaper.path })
        },
    })

    const resetMutation = trpc.wallpaper.resetProperties.useMutation({
        onSuccess: () => {
            utils.wallpaper.getSavedProperties.invalidate({ path: wallpaper.path })
            setLocalProperties({})
        },
    })

    // Merge fetched default values with saved custom values
    const properties = React.useMemo(() => {
        if (!fetchedProperties) return []

        return fetchedProperties.map((prop) => {
            const savedValue = savedProperties?.[prop.name] ?? localProperties[prop.name]
            if (savedValue !== undefined) {
                return { ...prop, value: savedValue }
            }
            return prop
        })
    }, [fetchedProperties, savedProperties, localProperties])

    const updateProperty = (name: string, value: string | number | boolean) => {
        const newProps = { ...localProperties, [name]: value }
        setLocalProperties(newProps)

        // Save to store
        const allProps = { ...savedProperties, ...newProps }
        saveMutation.mutate({
            path: wallpaper.path ?? "",
            properties: allProps,
        })
    }

    const handleReset = () => {
        resetMutation.mutate({ path: wallpaper.path ?? "" })
    }

    const colorToHex = (color: { r: number; g: number; b: number }) => {
        const r = Math.round(color.r * 255).toString(16).padStart(2, "0")
        const g = Math.round(color.g * 255).toString(16).padStart(2, "0")
        const b = Math.round(color.b * 255).toString(16).padStart(2, "0")
        return `#${r}${g}${b}`
    }

    return (
        <div className="mt-4 border-t border-border pt-4">
            <button
                className="flex w-full items-center justify-between text-sm font-medium"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span>Properties</span>
                <ChevronDown
                    className={`size-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
            </button>

            {isExpanded && (
                <div className="mt-3 space-y-1">
                    {isLoading && (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {!isLoading && properties.length === 0 && (
                        <p className="py-2 text-center text-sm text-muted-foreground">
                            No properties available
                        </p>
                    )}

                    {properties.map((property) => (
                        <div key={property.name}>
                            {property.type === "slider" && (
                                <SettingRow label={property.label}>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="range"
                                            min={property.min ?? 0}
                                            max={property.max ?? 100}
                                            step={property.step ?? 1}
                                            value={typeof property.value === "number" ? property.value : 0}
                                            onChange={(e) => updateProperty(property.name, parseFloat(e.target.value))}
                                            className="w-24 accent-primary"
                                        />
                                        <span className="w-10 text-right text-xs text-muted-foreground">
                                            {typeof property.value === "number" ? property.value.toFixed(1) : String(property.value)}
                                        </span>
                                    </div>
                                </SettingRow>
                            )}

                            {property.type === "boolean" && (
                                <SettingRow label={property.label}>
                                    <Switch
                                        checked={Boolean(property.value)}
                                        onCheckedChange={(checked) => updateProperty(property.name, checked)}
                                    />
                                </SettingRow>
                            )}

                            {property.type === "color" && typeof property.value === "object" && "r" in property.value && (
                                <SettingRow label={property.label}>
                                    <input
                                        type="color"
                                        value={colorToHex(property.value)}
                                        onChange={(e) => {
                                            const hex = e.target.value
                                            const r = parseInt(hex.slice(1, 3), 16) / 255
                                            const g = parseInt(hex.slice(3, 5), 16) / 255
                                            const b = parseInt(hex.slice(5, 7), 16) / 255
                                            // Store as string for JSON serialization
                                            updateProperty(property.name, `${r},${g},${b}`)
                                        }}
                                        className="size-8 cursor-pointer rounded border border-border bg-transparent"
                                    />
                                </SettingRow>
                            )}

                            {property.type === "combolist" && (
                                <SettingRow label={property.label}>
                                    <select
                                        value={String(property.value)}
                                        onChange={(e) => updateProperty(property.name, e.target.value)}
                                        className="h-8 rounded-md border border-input bg-secondary/50 px-2 text-sm"
                                    >
                                        {property.options?.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </SettingRow>
                            )}
                        </div>
                    ))}

                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 w-full gap-2 text-muted-foreground"
                        onClick={handleReset}
                        disabled={resetMutation.isPending}
                    >
                        <RotateCcw className="size-3.5" />
                        Reset to Defaults
                    </Button>
                </div>
            )}
        </div>
    )
}
