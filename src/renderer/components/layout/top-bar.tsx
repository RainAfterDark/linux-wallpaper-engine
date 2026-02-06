import { Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSearch, type SortBy } from "@/contexts/search-context"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { FiltersDropdown } from "./filters-dropdown"

export function TopBar() {
    const {
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
    } = useSearch()

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    }

    const sortLabels: Record<SortBy, string> = {
        name: "Name",
        size: "Size",
        recent: "Recent",
    }

    return (
        <header className="relative flex h-12 items-center justify-between border-b border-border/50 bg-gradient-to-r from-background via-background to-background/95 px-4 backdrop-blur-xl">
            {/* Subtle top highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

            <div className="flex flex-1 items-center gap-3">
                {/* Search Input - Refined with glow effect */}
                <div className="group relative max-w-sm flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60 transition-colors duration-200 group-focus-within:text-primary" />
                    <Input
                        type="text"
                        placeholder="Search wallpapers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 w-full rounded-lg border-0 bg-secondary/50 pl-9 pr-4 text-sm font-light tracking-wide text-foreground placeholder:text-muted-foreground/50 ring-1 ring-border/40 transition-all duration-300 focus:bg-secondary focus:ring-primary/40 focus:ring-2 hover:bg-secondary hover:ring-border"
                    />
                    {/* Glow effect on focus */}
                    <div className="absolute inset-0 -z-10 rounded-lg bg-primary/20 opacity-0 blur-xl transition-opacity duration-300 group-focus-within:opacity-100" />
                </div>

                {/* Filter & Sort Controls */}
                <div className="flex items-center gap-1.5">
                    {/* Unified Filters Dropdown */}
                    <FiltersDropdown />

                    {/* Sort Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "h-8 gap-1.5 rounded-lg px-3 text-xs font-medium tracking-wide transition-all duration-200",
                                    "bg-secondary/50 ring-1 ring-border/40 hover:bg-secondary hover:ring-border"
                                )}
                            >
                                <div className="flex items-center gap-1">
                                    {sortOrder === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                                </div>
                                <span className="hidden sm:inline">{sortLabels[sortBy]}</span>
                                <ChevronDown className="size-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[140px] rounded-xl border-border bg-popover/95 backdrop-blur-xl">
                            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Sort by</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-border/50" />
                            {(Object.keys(sortLabels) as SortBy[]).map((sort) => (
                                <DropdownMenuItem
                                    key={sort}
                                    onClick={() => setSortBy(sort)}
                                    className="flex items-center justify-between rounded-lg text-sm transition-colors"
                                >
                                    {sortLabels[sort]}
                                    {sortBy === sort && <Check className="size-3.5 text-primary" />}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator className="bg-border/50" />
                            <DropdownMenuItem
                                onClick={toggleSortOrder}
                                className="flex items-center gap-2 rounded-lg text-sm"
                            >
                                <ArrowUpDown className="size-3.5" />
                                {sortOrder === "asc" ? "Ascending" : "Descending"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
