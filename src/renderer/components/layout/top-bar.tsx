import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useSearchQuery } from "@/contexts/search-context"
import { FiltersDropdown } from "../wallpaper/filters-dropdown"
import { SortDropdown } from "../wallpaper/sort-dropdown"

// TODO: Move to wallpaper grid
export function TopBar() {
    const { searchQuery, setSearchQuery } = useSearchQuery()

    return (
        <header id="onboarding-topbar" className="relative flex h-12 items-center justify-between bg-background border-b border-border/50 px-4 py-2">
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
                </div>

                {/* Filter & Sort Controls */}
                <div className="flex items-center gap-1.5">
                    <FiltersDropdown />
                    <SortDropdown />
                </div>
            </div>
        </header>
    )
}
