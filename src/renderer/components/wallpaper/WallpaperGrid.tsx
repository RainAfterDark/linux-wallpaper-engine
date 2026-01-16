import * as React from "react"
import { WallpaperCard, type Wallpaper } from "./WallpaperCard"
import { WallpaperDetails } from "./WallpaperDetails"

// TODO: Replace with real wallpaper data from linux-wallpaperengine
const wallpapers: Wallpaper[] = []

interface WallpaperGridProps {
    filter?: "installed" | "workshop" | "all"
}

export function WallpaperGrid({ filter = "all" }: WallpaperGridProps) {
    const [selectedWallpaper, setSelectedWallpaper] =
        React.useState<Wallpaper | null>(null)

    const filteredWallpapers = React.useMemo(() => {
        if (filter === "installed") {
            return wallpapers.filter((w) => w.installed)
        }
        if (filter === "workshop") {
            return wallpapers.filter((w) => !w.installed)
        }
        return wallpapers
    }, [filter])

    return (
        <div className="flex gap-6">
            <div
                className={`grid flex-1 gap-4 ${selectedWallpaper
                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    }`}
            >
                {filteredWallpapers.map((wallpaper) => (
                    <WallpaperCard
                        key={wallpaper.id}
                        wallpaper={wallpaper}
                        selected={selectedWallpaper?.id === wallpaper.id}
                        onClick={setSelectedWallpaper}
                    />
                ))}
            </div>

            {selectedWallpaper && (
                <WallpaperDetails
                    wallpaper={selectedWallpaper}
                    onClose={() => setSelectedWallpaper(null)}
                />
            )}
        </div>
    )
}
