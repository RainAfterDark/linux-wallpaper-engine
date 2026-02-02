import * as React from "react"
import {
    X,
    Play,
    Monitor,
    HardDrive,
    Layers,
    Square,
    Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { type Wallpaper } from "./wallpaper-card"
import { WallpaperProperties } from "./wallpaper-properties"
import { trpc } from "@/lib/trpc"

interface WallpaperDetailsProps {
    wallpaper: Wallpaper
    onClose: () => void
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const typeLabels = {
    scene: "Scene",
    video: "Video",
    web: "Web",
    application: "Application",
}

export function WallpaperDetails({ wallpaper, onClose }: WallpaperDetailsProps) {
    const [isHovering, setIsHovering] = React.useState(false)
    const [isApplying, setIsApplying] = React.useState(false)

    const applyMutation = trpc.wallpaper.setWallpaper.useMutation()
    const stopMutation = trpc.wallpaper.stopWalpaper.useMutation()

    const handleApply = async () => {
        if (!wallpaper.path && !wallpaper.id) return
        setIsApplying(true)
        try {
            await applyMutation.mutateAsync({
                backgroundId: wallpaper.path || wallpaper.id,
            })
        } finally {
            setIsApplying(false)
        }
    }

    const handleStop = async () => {
        await stopMutation.mutateAsync({})
    }

    return (
        <div className="sticky top-0 h-fit w-80 shrink-0 overflow-y-auto rounded-xl border border-border bg-card">
            {/* Preview */}
            <div
                className="relative aspect-video overflow-hidden"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                <img
                    src={wallpaper.thumbnail}
                    alt={wallpaper.title}
                    className="size-full object-cover"
                />

                {/* Play overlay on hover */}
                <div
                    className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${isHovering ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <div className="flex size-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                        <Play className="size-5 text-white" fill="white" />
                    </div>
                </div>

                {/* Close button */}
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-2 top-2 size-7 bg-black/50 text-white hover:bg-black/70"
                    onClick={onClose}
                >
                    <X className="size-4" />
                </Button>
            </div>

            {/* Info */}
            <div className="p-4">
                <h2 className="text-lg font-semibold">{wallpaper.title}</h2>
                <p className="text-sm text-muted-foreground">by {wallpaper.author}</p>

                {/* Action buttons */}
                <div className="mt-4 flex gap-2">
                    <Button
                        className="flex-1 gap-2"
                        onClick={handleApply}
                        disabled={isApplying}
                    >
                        {isApplying ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Monitor className="size-4" />
                        )}
                        {isApplying ? "Applying..." : "Apply"}
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleStop}
                        disabled={stopMutation.isPending}
                        title="Stop wallpaper"
                    >
                        <Square className="size-4" />
                    </Button>
                </div>

                {/* Details */}
                <div className="mt-4 space-y-2 border-t border-border pt-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                            <Layers className="size-4" />
                            Type
                        </span>
                        <span>{typeLabels[wallpaper.type]}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                            <Monitor className="size-4" />
                            Resolution
                        </span>
                        <span>
                            {wallpaper.resolution.width}x{wallpaper.resolution.height}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                            <HardDrive className="size-4" />
                            Size
                        </span>
                        <span>{formatFileSize(wallpaper.fileSize)}</span>
                    </div>

                </div>

                {/* Tags */}
                <div className="mt-4 border-t border-border pt-4">
                    <p className="mb-2 text-sm font-medium text-muted-foreground">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                        {wallpaper.tags.map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Properties */}
                <WallpaperProperties wallpaper={wallpaper} />
            </div>
        </div>
    )
}
