import * as React from "react"
import { WallpaperCard, type Wallpaper } from "./wallpaper-card"
import { WallpaperDetails } from "./wallpaper-details"
import { RefreshButton } from "./refresh-button"
import { trpc } from "@/lib/trpc"
import { Loader2, AlertCircle, FolderOpen } from "lucide-react"
import { useDebounce } from "@uidotdev/usehooks"
import { useSearch } from "@/contexts/search-context"

interface WallpaperGridProps {
    filter?: "installed" | "workshop" | "all"
}

export function WallpaperGrid({ filter = "all" }: WallpaperGridProps) {
    const [selectedWallpaper, setSelectedWallpaper] =
        React.useState<Wallpaper | null>(null)
    const { searchQuery, filterType, filterTags, sortBy, sortOrder, setAvailableTags, filterCompatibility } = useSearch()
    const debouncedSearch = useDebounce(searchQuery, 300)

    const { data: compatibilityMap } = trpc.wallpaper.getCompatibilityMap.useQuery()
    const { data: settings } = trpc.settings.get.useQuery()

    const {
        data,
        isLoading,
        error,
        refetch,
    } = trpc.wallpaper.getWallpapers.useQuery({
        filter,
        search: debouncedSearch || undefined,
    })

    // Transform, filter and sort wallpapers
    const wallpapers: Wallpaper[] = React.useMemo(() => {
        if (!data) return []

        let result = data.map((w) => ({
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

        // Apply type filter
        if (filterType !== "all") {
            result = result.filter(w => w.type === filterType)
        }

        // Apply tag filter (wallpaper must have ALL selected tags)
        if (filterTags.length > 0) {
            result = result.filter(w =>
                filterTags.some(tag => w.tags?.includes(tag))
            )
        }

        // Apply compatibility filter (show only selected statuses)
        if (filterCompatibility.length > 0 && compatibilityMap) {
            result = result.filter(w => {
                const status = compatibilityMap[w.path ?? ''] ?? 'unknown'
                return filterCompatibility.includes(status)
            })
        }

        // Apply sorting
        result.sort((a, b) => {
            let comparison = 0

            switch (sortBy) {
                case "name":
                    comparison = a.title.localeCompare(b.title)
                    break
                case "size":
                    comparison = a.fileSize - b.fileSize
                    break
                case "recent":
                    comparison = b.id.localeCompare(a.id)
                    break
            }

            return sortOrder === "asc" ? comparison : -comparison
        })

        return result
    }, [data, filterType, filterTags, sortBy, sortOrder, filterCompatibility, compatibilityMap])

    // Extract and set available tags from raw data (before filtering)
    React.useEffect(() => {
        if (!data) return
        const allTags = data.flatMap(w => w.tags ?? [])
        const uniqueTags = [...new Set(allTags)].sort()
        setAvailableTags(uniqueTags)
    }, [data, setAvailableTags])

    const handleRefresh = () => {
        refetch()
    }

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
    if (wallpapers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <FolderOpen className="size-12 mb-4 opacity-50" />
                <p className="font-medium">No wallpapers found</p>
                <p className="text-sm mt-1">
                    {searchQuery
                        ? "Try a different search term"
                        : "Install wallpapers from Steam Workshop via Wallpaper Engine"}
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <div className="mb-6 flex flex-row items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Installed</h1>
                    <p className="text-muted-foreground">
                        Wallpapers downloaded to your system
                    </p>
                </div>
                <RefreshButton onClick={handleRefresh} isLoading={isLoading} />
            </div>

            <div className="flex items-start gap-6 flex-1">
                <div
                    className={`grid flex-1 gap-4 h-fit ${selectedWallpaper
                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                        : "grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
                        }`}
                >
                    {wallpapers.map((wallpaper) => (
                        <WallpaperCard
                            key={wallpaper.id}
                            wallpaper={wallpaper}
                            selected={selectedWallpaper?.id === wallpaper.id}
                            onClick={setSelectedWallpaper}
                            compatibilityStatus={compatibilityMap?.[wallpaper.path ?? '']}
                            showCompatibilityDot={settings?.showCompatibilityDot ?? true}
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

        </div>
    )
}
