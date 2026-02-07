import * as React from "react"
import { Play, Download, Star, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { WallpaperThumbnail } from "./wallpaper-thumbnail"

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
    path?: string
}

interface WallpaperCardProps {
    wallpaper: Wallpaper
    onClick?: (wallpaper: Wallpaper) => void
    selected?: boolean
}


export function WallpaperCard({
    wallpaper,
    onClick,
    selected,
}: WallpaperCardProps) {

    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-xl border bg-card transition-all duration-200 cursor-pointer",
                selected
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-ring/50 hover:shadow-lg"
            )}
            onClick={() => onClick?.(wallpaper)}
        >
            <WallpaperThumbnail
                src={wallpaper.thumbnail}
                alt={wallpaper.title}
                enableHover={true}
            >
                {/* Gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card via-card/20 to-transparent" />
            </WallpaperThumbnail>

            <div className="px-2.5 pb-2 pt-1">
                <h3 className="truncate text-[15px] font-semibold tracking-tight text-card-foreground">
                    {wallpaper.title}
                </h3>
            </div>
        </div>
    )
}
