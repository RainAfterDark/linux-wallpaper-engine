import * as React from "react"
import {
    X,
    Monitor,
    HardDrive,
    Layers,
    Square,
    Loader2,
    ChevronDown,
    ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { type Wallpaper } from "./wallpaper-card"
import { WallpaperOverrides } from "./wallpaper-overrides"
import { trpc } from "@/lib/trpc"
import { formatFileSize, WALLPAPER_TYPE_LABELS } from "@/lib/utils"
import { WallpaperThumbnail } from "./wallpaper-thumbnail"
import { COMPATIBILITY_OPTIONS, type CompatibilityStatus } from "../../../shared/constants"

interface WallpaperDetailsProps {
    wallpaper: Wallpaper
    onClose: () => void
}



export function WallpaperDetails({ wallpaper, onClose }: WallpaperDetailsProps) {
    const [isApplying, setIsApplying] = React.useState(false)

    const { data: displays } = trpc.display.list.useQuery()
    const applyMutation = trpc.wallpaper.setWallpaper.useMutation()
    const stopMutation = trpc.wallpaper.stopWalpaper.useMutation()

    const handleApply = async (screen?: string) => {
        if (!wallpaper.path && !wallpaper.id) return
        setIsApplying(true)
        try {
            await applyMutation.mutateAsync({
                backgroundId: wallpaper.path || wallpaper.id,
                screen,
            })
        } finally {
            setIsApplying(false)
        }
    }

    const handleStop = async () => {
        await stopMutation.mutateAsync({})
    }

    return (
        <div id="wallpaper-details" className="sticky top-0 max-h-[85vh] w-80 shrink-0 overflow-y-auto rounded-xl border border-border bg-card glass scrollbar-thin ">
            {/* Preview */}
            <WallpaperThumbnail
                src={wallpaper.thumbnail}
                alt={wallpaper.title}

                containerClassName="rounded-t-xl"
            >
                <div
                    className="absolute inset-0"
                >

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
            </WallpaperThumbnail>

            {/* Info */}
            <div className="p-4">
                <h2 className="text-lg font-semibold">{wallpaper.title}</h2>
                <p className="text-sm text-muted-foreground">by {wallpaper.author}</p>

                {/* Action buttons */}
                <div className="mt-4 flex gap-2">
                    <div className="flex flex-1">
                        <Button
                            className="flex-1 gap-2 rounded-r-none"
                            onClick={() => handleApply()}
                            disabled={isApplying}
                        >
                            {isApplying ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Monitor className="size-4" />
                            )}
                            {isApplying ? "Applying..." : "Apply"}
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    className="rounded-l-none border-l border-primary-foreground/20 px-2"
                                    disabled={isApplying}
                                >
                                    <ChevronDown className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">

                                {displays && displays.length > 0 && (
                                    <>
                                        {displays.map((display) => (
                                            <DropdownMenuItem
                                                key={display.name}
                                                onClick={() => handleApply(display.name)}
                                            >
                                                <Monitor className="size-4" />
                                                {display.name}
                                                {display.primary && (
                                                    <span className="ml-auto text-xs text-muted-foreground">Primary</span>
                                                )}
                                            </DropdownMenuItem>

                                        ))}
                                        <DropdownMenuSeparator />
                                    </>
                                )}
                                <DropdownMenuItem onClick={() => handleApply()}>
                                    <Monitor className="size-4" />
                                    All
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
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
                        <span>{WALLPAPER_TYPE_LABELS[wallpaper.type]}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                            <Monitor className="size-4" />
                            Resolution
                        </span>
                        <span>
                            {wallpaper.resolution.width > 0 && wallpaper.resolution.height > 0
                                ? `${wallpaper.resolution.width}x${wallpaper.resolution.height}`
                                : 'N/A'}
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

                {/* Compatibility */}
                <CompatibilitySection wallpaperPath={wallpaper.path ?? ''} />

                <WallpaperOverrides wallpaper={wallpaper} />
            </div>
        </div>
    )
}

function CompatibilitySection({ wallpaperPath }: { wallpaperPath: string }) {
    const utils = trpc.useUtils()
    const { data: overrides } = trpc.wallpaper.getOverrides.useQuery(
        { path: wallpaperPath },
        { enabled: !!wallpaperPath },
    )

    const setCompatibility = trpc.wallpaper.setCompatibility.useMutation({
        onSuccess: () => {
            utils.wallpaper.getOverrides.invalidate({ path: wallpaperPath })
            utils.wallpaper.getCompatibilityMap.invalidate()
        },
    })

    const currentStatus: CompatibilityStatus = overrides?.compatibility ?? 'unknown'

    return (
        <div className="mt-4 border-t border-border pt-4">
            <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="size-4" />
                    Compatibility
                </span>
                <Select
                    value={currentStatus}
                    onValueChange={(value) => {
                        setCompatibility.mutate({
                            path: wallpaperPath,
                            status: value as CompatibilityStatus,
                        })
                    }}
                >
                    <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {COMPATIBILITY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                <span className="flex items-center gap-2">
                                    <span className={`size-2 rounded-full ${option.bgColor}`} />
                                    {option.label}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
