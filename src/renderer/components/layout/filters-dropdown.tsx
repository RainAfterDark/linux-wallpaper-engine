import * as React from "react"
import { Check, ChevronDown, SlidersHorizontal, Tag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useSearch, type WallpaperType } from "@/contexts/search-context"

export function FiltersDropdown() {
    const {
        filterType,
        setFilterType,
        filterTags,
        toggleTag,
        setFilterTags,
        availableTags
    } = useSearch()

    const filterLabels: Record<WallpaperType, string> = {
        all: "All Types",
        scene: "Scene",
        video: "Video",
        web: "Web",
        application: "Application",
    }

    const activeFilterCount = (filterType !== "all" ? 1 : 0) + filterTags.length

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "h-8 gap-1.5 rounded-lg px-3 text-xs font-medium tracking-wide transition-all duration-200",
                        "bg-secondary/50 ring-1 ring-border/40 hover:bg-secondary hover:ring-border",
                        activeFilterCount > 0 && "ring-primary/40 text-primary bg-primary/10"
                    )}
                >
                    <SlidersHorizontal className="size-3.5" />
                    <span className="hidden sm:inline">
                        {activeFilterCount > 0 ? `${activeFilterCount} Filters` : "Filters"}
                    </span>
                    <ChevronDown className="size-3 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-56 rounded-xl border-border bg-popover"
            >
                {/* Header with Clear All */}
                <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Filters</span>
                    {activeFilterCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 px-1.5 text-[10px] hover:text-destructive"
                            onClick={(e) => {
                                e.stopPropagation()
                                setFilterType("all")
                                setFilterTags([])
                            }}
                        >
                            <X className="mr-1 size-3" />
                            Clear All
                        </Button>
                    )}
                </div>

                <DropdownMenuSeparator className="bg-border/50" />

                {/* Type Filter Section */}
                <DropdownMenuLabel className="ml-2 text-[10px] font-normal uppercase text-muted-foreground">Type</DropdownMenuLabel>
                {(Object.keys(filterLabels) as WallpaperType[]).map((type) => (
                    <DropdownMenuItem
                        key={type}
                        onClick={() => setFilterType(type)}
                        className="flex items-center justify-between rounded-lg text-xs"
                    >
                        <span>{filterLabels[type]}</span>
                        {filterType === type && <Check className="size-3.5 text-primary" />}
                    </DropdownMenuItem>
                ))}

                {/* Tags Section - Only show if tags exist */}
                {availableTags.length > 0 && (
                    <>
                        <DropdownMenuSeparator className="bg-border/50" />
                        <DropdownMenuLabel className="ml-2 flex items-center justify-between text-[10px] font-normal uppercase text-muted-foreground">
                            <span>Tags</span>
                            {filterTags.length > 0 && (
                                <span className="text-primary">{filterTags.length} selected</span>
                            )}
                        </DropdownMenuLabel>

                        <div className="max-h-48 overflow-y-auto px-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/40 hover:scrollbar-thumb-border">
                            {availableTags.map((tag) => (
                                <DropdownMenuItem
                                    key={tag}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        toggleTag(tag)
                                    }}
                                    className="flex items-center justify-between rounded-lg text-xs"
                                >
                                    <span className="truncate">{tag}</span>
                                    {filterTags.includes(tag) && <Check className="size-3.5 shrink-0 text-primary" />}
                                </DropdownMenuItem>
                            ))}
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
