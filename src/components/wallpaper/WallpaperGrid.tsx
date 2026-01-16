import * as React from "react"
import { WallpaperCard, type Wallpaper } from "./WallpaperCard"
import { WallpaperDetails } from "./WallpaperDetails"

// Mock wallpaper data
const mockWallpapers: Wallpaper[] = [
    {
        id: "1",
        workshopId: "2667198601",
        title: "Mountain Sunset",
        author: "NatureArtist",
        type: "scene",
        thumbnail: "https://picsum.photos/seed/mount1/640/360",
        resolution: { width: 1920, height: 1080 },
        fileSize: 45000000,
        rating: 4.8,
        tags: ["nature", "mountains", "sunset"],
        installed: true,
    },
    {
        id: "2",
        workshopId: "2667198602",
        title: "Cyberpunk City",
        author: "NeonDreams",
        type: "video",
        thumbnail: "https://picsum.photos/seed/cyber1/640/360",
        resolution: { width: 3840, height: 2160 },
        fileSize: 120000000,
        rating: 4.9,
        tags: ["cyberpunk", "city", "neon"],
        installed: true,
    },
    {
        id: "3",
        workshopId: "2667198603",
        title: "Rainy Window",
        author: "CozyVibes",
        type: "scene",
        thumbnail: "https://picsum.photos/seed/rain1/640/360",
        resolution: { width: 1920, height: 1080 },
        fileSize: 32000000,
        rating: 4.7,
        tags: ["rain", "cozy", "relaxing"],
        installed: false,
    },
    {
        id: "4",
        workshopId: "2667198604",
        title: "Ocean Waves",
        author: "SeaScapes",
        type: "video",
        thumbnail: "https://picsum.photos/seed/ocean1/640/360",
        resolution: { width: 2560, height: 1440 },
        fileSize: 85000000,
        rating: 4.6,
        tags: ["ocean", "waves", "nature"],
        installed: false,
    },
    {
        id: "5",
        workshopId: "2667198605",
        title: "Northern Lights",
        author: "AuroraHunter",
        type: "scene",
        thumbnail: "https://picsum.photos/seed/aurora1/640/360",
        resolution: { width: 3840, height: 2160 },
        fileSize: 67000000,
        rating: 4.9,
        tags: ["aurora", "night", "nature"],
        installed: true,
    },
    {
        id: "6",
        workshopId: "2667198606",
        title: "Anime Lofi Girl",
        author: "ChillBeats",
        type: "scene",
        thumbnail: "https://picsum.photos/seed/lofi1/640/360",
        resolution: { width: 1920, height: 1080 },
        fileSize: 28000000,
        rating: 4.8,
        tags: ["anime", "lofi", "study"],
        installed: false,
    },
    {
        id: "7",
        workshopId: "2667198607",
        title: "Space Nebula",
        author: "CosmicArt",
        type: "scene",
        thumbnail: "https://picsum.photos/seed/space1/640/360",
        resolution: { width: 3840, height: 2160 },
        fileSize: 95000000,
        rating: 4.7,
        tags: ["space", "nebula", "stars"],
        installed: true,
    },
    {
        id: "8",
        workshopId: "2667198608",
        title: "Fireplace Ambiance",
        author: "CozyHome",
        type: "video",
        thumbnail: "https://picsum.photos/seed/fire1/640/360",
        resolution: { width: 1920, height: 1080 },
        fileSize: 55000000,
        rating: 4.5,
        tags: ["cozy", "fireplace", "winter"],
        installed: false,
    },
]

interface WallpaperGridProps {
    filter?: "installed" | "workshop" | "all"
}

export function WallpaperGrid({ filter = "all" }: WallpaperGridProps) {
    const [selectedWallpaper, setSelectedWallpaper] =
        React.useState<Wallpaper | null>(null)

    const filteredWallpapers = React.useMemo(() => {
        if (filter === "installed") {
            return mockWallpapers.filter((w) => w.installed)
        }
        if (filter === "workshop") {
            return mockWallpapers.filter((w) => !w.installed)
        }
        return mockWallpapers
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
