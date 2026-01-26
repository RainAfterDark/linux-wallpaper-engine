import * as React from "react"
import { WallpaperCard, type Wallpaper } from "./WallpaperCard"
import { WallpaperDetails } from "./WallpaperDetails"
import { RefreshButton } from "./RefreshButton"
import { trpc } from "@/lib/trpc"
import { Loader2, AlertCircle, FolderOpen } from "lucide-react"

interface WallpaperGridProps {
    filter?: "installed" | "workshop" | "all"
}

export function WallpaperGrid({ filter = "all" }: WallpaperGridProps) {
    const [selectedWallpaper, setSelectedWallpaper] =
        React.useState<Wallpaper | null>(null)

    // Fetch wallpapers from backend
    const { data: backendWallpapers, isLoading, error, refetch, isFetching } = trpc.wallpaper.scan.useQuery()

    // Transform backend data to frontend Wallpaper type
    const wallpapers: Wallpaper[] = React.useMemo(() => {
        if (!backendWallpapers) return []
        return backendWallpapers.map((w) => ({
            id: w.id,
            workshopId: w.workshopId,
            title: w.title,
            author: w.author,
            type: w.type,
            thumbnail: w.thumbnail ? `local-file://${w.thumbnail}` : '',
            previewUrl: w.previewUrl ? `local-file://${w.previewUrl}` : undefined,
            resolution: w.resolution,
            fileSize: w.fileSize,
            tags: w.tags,
            installed: w.installed,
            path: w.path,
        }))
    }, [backendWallpapers])

    const filteredWallpapers = React.useMemo(() => {
        if (filter === "installed") {
            return wallpapers.filter((w) => w.installed)
        }
        if (filter === "workshop") {
            return wallpapers.filter((w) => !w.installed)
        }
        return wallpapers
    }, [filter, wallpapers])

    // Loading state
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="size-8 animate-spin mb-4" />
                <p>Scanning for wallpapers...</p>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-destructive">
                <AlertCircle className="size-8 mb-4" />
                <p className="font-medium">Failed to load wallpapers</p>
                <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
            </div>
        )
    }

    // Empty state
    if (filteredWallpapers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <FolderOpen className="size-12 mb-4 opacity-50" />
                <p className="font-medium">No wallpapers found</p>
                <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm">
                        Install wallpapers from Steam Workshop via Wallpaper Engine
                    </p>
                    <RefreshButton onClick={() => refetch()} isLoading={isFetching} />
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="mb-6 flex flex-row items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Installed</h1>
                    <p className="text-muted-foreground">
                        Wallpapers downloaded to your system
                    </p>
                </div>
                <RefreshButton onClick={() => refetch()} isLoading={isFetching} />
            </div>
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
        </>
    )
}
