import { motion, AnimatePresence } from "framer-motion"
import { WallpaperCard, type Wallpaper } from "./wallpaper-card"
import { GridHeader } from "./grid-header"
import { trpc } from "@/lib/trpc"
import { AlertCircle, FolderOpen } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebounce } from "@uidotdev/usehooks"
import { useSearch } from "@/contexts/search-context"
import { useWallpaperBackground } from "@/contexts/wallpaper-background-context"
import { useState, useMemo, useEffect, useCallback, lazy, Suspense } from "react"

const WallpaperDetails = lazy(() => import("./wallpaper-details").then(m => ({ default: m.WallpaperDetails })))

export function WallpaperGrid() {
    const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null)
    const [detailsVisible, setDetailsVisible] = useState(false)
    const { searchQuery, filterType, filterTags, sortBy, sortOrder, setAvailableTags, filterCompatibility } = useSearch()
    const debouncedSearch = useDebounce(searchQuery, 300)
    const { setSelectedUrl } = useWallpaperBackground()

    const { data: compatibilityMap } = trpc.wallpaper.getCompatibilityMap.useQuery()
    const { data: settings } = trpc.settings.get.useQuery()

    const {
        data,
        isLoading,
        error,
        refetch,
    } = trpc.wallpaper.getWallpapers.useQuery({
        search: debouncedSearch || undefined,
    })

    // Transform, filter and sort wallpapers
    const wallpapers: Wallpaper[] = useMemo(() => {
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
            dateAdded: w.dateAdded,
            tags: w.tags,
            installed: w.installed,
            path: w.path,
        }))

        // Apply all filters in a single pass
        const hasTypeFilter = filterType !== "all"
        const hasTagFilter = filterTags.length > 0
        const hasCompatFilter = filterCompatibility.length > 0 && compatibilityMap
        const compatSet = hasCompatFilter ? new Set(filterCompatibility) : null

        if (hasTypeFilter || hasTagFilter || hasCompatFilter) {
            result = result.filter(w => {
                if (hasTypeFilter && w.type !== filterType) return false
                if (hasTagFilter && !filterTags.some(tag => w.tags?.includes(tag))) return false
                if (compatSet && compatibilityMap) {
                    const status = compatibilityMap[w.path ?? ''] ?? 'unknown'
                    if (!compatSet.has(status)) return false
                }
                return true
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
                case "date":
                    comparison = a.dateAdded - b.dateAdded
                    break
            }

            return sortOrder === "asc" ? comparison : -comparison
        })

        return result
    }, [data, filterType, filterTags, sortBy, sortOrder, filterCompatibility, compatibilityMap])

    // Sync selected wallpaper thumbnail as blurred page background
    useEffect(() => {
        setSelectedUrl(selectedWallpaper?.thumbnail ?? null)
    }, [selectedWallpaper, setSelectedUrl])


    // Extract and set available tags from raw data (before filtering)
    useEffect(() => {
        if (!data) return
        const allTags = data.flatMap(w => w.tags ?? [])
        const uniqueTags = [...new Set(allTags)].sort()
        setAvailableTags(uniqueTags)
    }, [data, setAvailableTags])

    const toggleWallpaper = useCallback((w: Wallpaper) => {
        setSelectedWallpaper(prev => prev?.id === w.id ? null : w)
    }, [])

    const handleRefresh = () => {
        refetch()
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="flex flex-col h-full">
                <GridHeader onRefresh={handleRefresh} isLoading={isLoading} />
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
                    ))}
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col h-full">
                <GridHeader onRefresh={handleRefresh} isLoading={isLoading} />
                <motion.div
                    className="flex flex-col items-center justify-center py-20 text-destructive"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                >
                    <AlertCircle className="size-8 mb-4" />
                    <p className="font-medium">Failed to load wallpapers</p>
                    <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
                </motion.div>
            </div>
        )
    }

    // Empty state
    if (wallpapers.length === 0) {
        return (
            <div className="flex flex-col h-full">
                <GridHeader onRefresh={handleRefresh} isLoading={isLoading} />
                <motion.div
                    className="flex flex-col items-center justify-center py-20 text-muted-foreground"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                >
                    <FolderOpen className="size-12 mb-4 opacity-50" />
                    <p className="font-medium">No wallpapers found</p>
                    <p className="text-sm mt-1">
                        {searchQuery
                            ? "Try a different search term"
                            : "Install wallpapers from Steam Workshop via Wallpaper Engine"}
                    </p>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <GridHeader onRefresh={handleRefresh} isLoading={isLoading} />

            <div className="flex items-start gap-6 flex-1">
                <div
                    id="onboarding-wallpaper-grid"
                    className={`grid flex-1 gap-4 h-fit transition-all duration-300 ${detailsVisible
                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                        : "grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
                        }`}
                >
                    {wallpapers.map((wallpaper) => (
                        <WallpaperCard
                            key={wallpaper.id}
                            wallpaper={wallpaper}
                            selected={selectedWallpaper?.id === wallpaper.id}
                            onClick={toggleWallpaper}
                            compatibilityStatus={compatibilityMap?.[wallpaper.path ?? '']}
                            showCompatibilityDot={settings?.showCompatibilityDot ?? true}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait" onExitComplete={() => setDetailsVisible(false)}>
                    {selectedWallpaper && (
                        <motion.div
                            key={selectedWallpaper.id}
                            className="sticky top-0"
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            onAnimationStart={() => setDetailsVisible(true)}
                        >
                            <Suspense fallback={<Skeleton className="w-80 h-96 rounded-xl" />}>
                                <WallpaperDetails
                                    wallpaper={selectedWallpaper}
                                    onClose={() => setSelectedWallpaper(null)}
                                />
                            </Suspense>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    )
}
