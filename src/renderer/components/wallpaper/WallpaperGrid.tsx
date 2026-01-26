import * as React from "react"
import { WallpaperCard, type Wallpaper } from "./WallpaperCard"
import { WallpaperDetails } from "./WallpaperDetails"
import { RefreshButton } from "./RefreshButton"
import { trpc } from "@/lib/trpc"
import { Loader2, AlertCircle, FolderOpen } from "lucide-react"
import { useDebounce } from "@uidotdev/usehooks"
import { useSearch } from "@/contexts/SearchContext"

interface WallpaperGridProps {
    filter?: "installed" | "workshop" | "all"
}

export function WallpaperGrid({ filter = "all" }: WallpaperGridProps) {
    const [selectedWallpaper, setSelectedWallpaper] =
        React.useState<Wallpaper | null>(null)
    const { searchQuery } = useSearch()
    const debouncedSearch = useDebounce(searchQuery, 300)
    const scrollRef = React.useRef<HTMLDivElement>(null)

    // Fetch wallpapers with infinite scroll
    const {
        data,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
    } = trpc.wallpaper.getWallpapers.useInfiniteQuery(
        {
            filter,
            search: debouncedSearch || undefined,
            limit: 50,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
    )

    // Transform backend data to frontend Wallpaper type
    const wallpapers: Wallpaper[] = React.useMemo(() => {
        if (!data?.pages) return []
        return data.pages.flatMap((page) =>
            page.wallpapers.map((w) => ({
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
            })),
        )
    }, [data])

    // Infinite scroll handler
    React.useEffect(() => {
        const handleScroll = () => {
            if (!scrollRef.current || !hasNextPage || isFetchingNextPage) return

            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
            if (scrollTop + clientHeight >= scrollHeight - 500) {
                fetchNextPage()
            }
        }

        const scrollElement = scrollRef.current
        scrollElement?.addEventListener('scroll', handleScroll)
        return () => scrollElement?.removeEventListener('scroll', handleScroll)
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

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

            <div ref={scrollRef} className="flex gap-6 overflow-y-auto flex-1">
                <div
                    className={`grid flex-1 gap-4 h-fit ${selectedWallpaper
                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        }`}
                >
                    {wallpapers.map((wallpaper) => (
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

            {/* Loading more indicator */}
            {isFetchingNextPage && (
                <div className="flex justify-center py-4">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
            )}
        </div>
    )
}
