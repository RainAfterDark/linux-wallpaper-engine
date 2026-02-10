import * as React from "react"
import { Play, Download, Star, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { WallpaperThumbnail } from "./wallpaper-thumbnail"
import { COMPATIBILITY_CONFIG, type CompatibilityStatus } from "../../../shared/constants"

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
    compatibilityStatus?: CompatibilityStatus
    showCompatibilityDot?: boolean
}


export function WallpaperCard({
    wallpaper,
    onClick,
    selected,
    compatibilityStatus,
    showCompatibilityDot = true,
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
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background via-background/20 to-transparent" />
                {showCompatibilityDot && compatibilityStatus && compatibilityStatus !== 'unknown' && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className={cn(
                                "absolute top-2 right-2 size-2.5 rounded-full ring-1 ring-black/20",
                                COMPATIBILITY_CONFIG[compatibilityStatus].bgColor
                            )} />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                            {COMPATIBILITY_CONFIG[compatibilityStatus].label}
                        </TooltipContent>
                    </Tooltip>
                )}
            </WallpaperThumbnail>

            <div className="px-2.5 pb-2 pt-1">
                <h3 className="truncate text-[15px]  font-semibold tracking-tight text-card-foreground">
                    {wallpaper.title}
                </h3>
            </div>
        </div>
    )
}
