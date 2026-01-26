import * as React from "react"
import { ChevronDown, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { type Wallpaper } from "./WallpaperCard"
import { trpc } from "@/lib/trpc"

interface WallpaperPropertiesProps {
    wallpaper: Wallpaper
}

// Property types based on linux-wallpaperengine --list-properties output
interface PropertySlider {
    type: "slider"
    name: string
    label: string
    value: number
    min?: number
    max?: number
    step?: number
}

interface PropertyBoolean {
    type: "boolean"
    name: string
    label: string
    value: boolean
}

interface PropertyColor {
    type: "color"
    name: string
    label: string
    value: { r: number; g: number; b: number; a: number }
}

interface PropertyCombolist {
    type: "combolist"
    name: string
    label: string
    value: string
    options?: { label: string; value: string }[]
}

type WallpaperProperty =
    | PropertySlider
    | PropertyBoolean
    | PropertyColor
    | PropertyCombolist

export function WallpaperProperties({ wallpaper }: WallpaperPropertiesProps) {
    const [isExpanded, setIsExpanded] = React.useState(true)
    const [properties, setProperties] = React.useState<WallpaperProperty[]>([])

    const { data: fetchedProperties, isLoading } = trpc.wallpaper.getProperties.useQuery(
        { path: wallpaper.path ?? "" },
        { enabled: Boolean(wallpaper.path) }
    )

    // Sync fetched properties to local state for editing
    React.useEffect(() => {
        if (fetchedProperties) {
            setProperties(fetchedProperties as WallpaperProperty[])
        }
    }, [fetchedProperties])

    const updateProperty = (name: string, value: unknown) => {
        setProperties((prev) =>
            prev.map((p) => (p.name === name ? { ...p, value } as WallpaperProperty : p))
        )
    }

    const resetProperties = () => {
        if (fetchedProperties) {
            setProperties(fetchedProperties as WallpaperProperty[])
        }
    }

    return (
        <div className="mt-4 border-t border-border pt-4">
            <button
                className="flex w-full items-center justify-between text-sm font-medium"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span>Properties</span>
                <ChevronDown
                    className={`size-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""
                        }`}
                />
            </button>

            {isExpanded && (
                <div className="mt-3 space-y-4">
                    {isLoading && (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i}>
                                    <Skeleton className="mb-1.5 h-3 w-20" />
                                    <Skeleton className="h-6 w-full" />
                                </div>
                            ))}
                        </div>
                    )}
                    {!isLoading && properties.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground">
                            No properties available
                        </p>
                    )}
                    {properties.map((property) => (
                        <div key={property.name}>
                            <label className="mb-1.5 block text-xs text-muted-foreground">
                                {property.label}
                            </label>

                            {property.type === "slider" && (
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min={property.min ?? 0}
                                        max={property.max ?? 100}
                                        step={property.step ?? 1}
                                        value={property.value}
                                        onChange={(e) =>
                                            updateProperty(property.name, parseFloat(e.target.value))
                                        }
                                        className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-secondary [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                                    />
                                    <span className="w-10 text-right text-xs text-muted-foreground">
                                        {property.value.toFixed(1)}
                                    </span>
                                </div>
                            )}

                            {property.type === "boolean" && (
                                <button
                                    onClick={() => updateProperty(property.name, !property.value)}
                                    className={`relative h-5 w-9 rounded-full transition-colors ${property.value ? "bg-primary" : "bg-secondary"
                                        }`}
                                >
                                    <span
                                        className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-all ${property.value ? "left-4" : "left-0.5"
                                            }`}
                                    />
                                </button>
                            )}

                            {property.type === "color" && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={`#${Math.round(property.value.r * 255)
                                            .toString(16)
                                            .padStart(2, "0")}${Math.round(property.value.g * 255)
                                                .toString(16)
                                                .padStart(2, "0")}${Math.round(property.value.b * 255)
                                                    .toString(16)
                                                    .padStart(2, "0")}`}
                                        onChange={(e) => {
                                            const hex = e.target.value
                                            updateProperty(property.name, {
                                                r: parseInt(hex.slice(1, 3), 16) / 255,
                                                g: parseInt(hex.slice(3, 5), 16) / 255,
                                                b: parseInt(hex.slice(5, 7), 16) / 255,
                                                a: 1,
                                            })
                                        }}
                                        className="size-8 cursor-pointer rounded border border-border bg-transparent"
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        RGB({Math.round(property.value.r * 255)},{" "}
                                        {Math.round(property.value.g * 255)},{" "}
                                        {Math.round(property.value.b * 255)})
                                    </span>
                                </div>
                            )}

                            {property.type === "combolist" && (
                                <select
                                    value={property.value}
                                    onChange={(e) =>
                                        updateProperty(property.name, e.target.value)
                                    }
                                    className="h-8 w-full rounded-md border border-input bg-secondary/50 px-2 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                                >
                                    {property.options?.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    ))}

                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full gap-2 text-muted-foreground"
                        onClick={resetProperties}
                    >
                        <RotateCcw className="size-3.5" />
                        Reset to Defaults
                    </Button>
                </div>
            )}
        </div>
    )
}
