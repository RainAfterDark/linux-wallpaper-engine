import { Pause, Play, Volume2, VolumeX, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { trpc } from "@/lib/trpc"
import { useState, useMemo } from "react"

export function StatusBar() {
    const [isPaused, setIsPaused] = useState(false)
    const [isMuted, setIsMuted] = useState(false)

    const { data: activeWallpapers = [] } = trpc.wallpaper.getActive.useQuery(undefined, {
        refetchInterval: 5000, // Refresh every 5 seconds
    })

    const { data: displays = [] } = trpc.wallpaper.getDisplays.useQuery()

    // Fetch all wallpapers to get metadata
    const { data: wallpapersData } = trpc.wallpaper.getWallpapers.useQuery({
        limit: 1000,
        filter: 'all',
    })

    const stopMutation = trpc.wallpaper.stop.useMutation()
    const utils = trpc.useUtils()

    // Get the primary display or first display
    const primaryDisplay = displays.find(d => d.primary) ?? displays[0]

    // Get the active wallpaper for the primary display
    const activeWallpaper = activeWallpapers.find(
        w => w.screen === primaryDisplay?.name
    ) ?? activeWallpapers[0]

    // Get the wallpaper metadata
    const wallpaperTitle = useMemo(() => {
        if (!activeWallpaper || !wallpapersData?.wallpapers) return null

        const backgroundId = activeWallpaper.wallpaper.backgroundId
        const wallpaper = wallpapersData.wallpapers.find(
            w => w.path === backgroundId || w.id === backgroundId
        )

        return wallpaper?.title ?? backgroundId.split('/').pop() ?? 'Unknown'
    }, [activeWallpaper, wallpapersData])

    const handlePauseToggle = async () => {
        if (!activeWallpaper) return

        // For now, we'll stop the wallpaper when pausing
        // A proper pause/resume would require backend support
        if (!isPaused) {
            await stopMutation.mutateAsync({ screen: activeWallpaper.screen })
            setIsPaused(true)
            // Invalidate the active wallpapers query to refresh the UI
            utils.wallpaper.getActive.invalidate()
        } else {
            // Would need to reapply the wallpaper here
            setIsPaused(false)
        }
    }

    const handleMuteToggle = () => {
        // This would require backend support to change volume on the fly
        // For now, just toggle the UI state
        setIsMuted(!isMuted)
    }

    return (
        <footer className="flex h-10 items-center justify-between border-t border-border bg-sidebar px-4">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Monitor className="size-3.5" />
                    <span>{primaryDisplay?.name ?? "No Display"}</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                    {activeWallpaper ? (
                        <>
                            <div className="size-2 rounded-full bg-success" />
                            <span className="text-sm text-muted-foreground">
                                Active: {wallpaperTitle}
                            </span>
                        </>
                    ) : (
                        <>
                            <div className="size-2 rounded-full bg-muted-foreground/50" />
                            <span className="text-sm text-muted-foreground">
                                No active wallpaper
                            </span>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-7"
                    onClick={handlePauseToggle}
                    disabled={!activeWallpaper}
                    title={isPaused ? "Resume wallpaper" : "Pause wallpaper"}
                >
                    {isPaused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
                </Button>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-7"
                    onClick={handleMuteToggle}
                    disabled={!activeWallpaper}
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {isMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
                </Button>
            </div>
        </footer>
    )
}
