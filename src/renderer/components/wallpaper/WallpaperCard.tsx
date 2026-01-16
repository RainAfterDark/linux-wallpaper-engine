import * as React from "react"
import { Play, Download, Star, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface Wallpaper {
    id: string
    workshopId?: string
    title: string
    author: string
    type: "scene" | "video" | "web" | "application"
    thumbnail: string
    previewUrl?: string
    resolution: { width: number; height: number }
    fileSize: number
    rating?: number
    tags: string[]
    installed: boolean
}

interface WallpaperCardProps {
    wallpaper: Wallpaper
    onClick?: (wallpaper: Wallpaper) => void
    selected?: boolean
}

const typeColors = {
    scene: "bg-purple-500/80",
    video: "bg-blue-500/80",
    web: "bg-green-500/80",
    application: "bg-orange-500/80",
}

const typeLabels = {
    scene: "Scene",
    video: "Video",
    web: "Web",
    application: "App",
}

export function WallpaperCard({
    wallpaper,
    onClick,
    selected,
}: WallpaperCardProps) {
    const [isHovering, setIsHovering] = React.useState(false)

    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-xl border bg-card transition-all duration-200 cursor-pointer",
                selected
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-ring/50 hover:shadow-lg"
            )}
            onClick={() => onClick?.(wallpaper)}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <div className="relative aspect-video overflow-hidden">
                <img
                    src={wallpaper.thumbnail}
                    alt={wallpaper.title}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Type badge */}
                <div className="absolute left-2 top-2">
                    <span
                        className={cn(
                            "rounded-md px-2 py-0.5 text-xs font-medium text-white",
                            typeColors[wallpaper.type]
                        )}
                    >
                        {typeLabels[wallpaper.type]}
                    </span>
                </div>

                {/* Installed indicator */}
                {wallpaper.installed && (
                    <div className="absolute right-2 top-2">
                        <div className="flex size-6 items-center justify-center rounded-full bg-green-500/90">
                            <Download className="size-3 text-white" />
                        </div>
                    </div>
                )}

                {/* Hover overlay with play button */}
                <div
                    className={cn(
                        "absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-200",
                        isHovering ? "opacity-100" : "opacity-0"
                    )}
                >
                    <div className="flex size-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform duration-200 hover:scale-110">
                        <Play className="size-6 text-white" fill="white" />
                    </div>
                </div>

                {/* Gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent" />
            </div>

            <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <h3 className="truncate font-medium text-card-foreground">
                            {wallpaper.title}
                        </h3>
                        <p className="truncate text-sm text-muted-foreground">
                            by {wallpaper.author}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="size-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(e) => {
                            e.stopPropagation()
                            // TODO: Open context menu
                        }}
                    >
                        <MoreHorizontal className="size-4" />
                    </Button>
                </div>

                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                        {wallpaper.resolution.width}x{wallpaper.resolution.height}
                    </span>
                    {wallpaper.rating && (
                        <div className="flex items-center gap-1">
                            <Star className="size-3 fill-yellow-400 text-yellow-400" />
                            <span>{wallpaper.rating.toFixed(1)}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
