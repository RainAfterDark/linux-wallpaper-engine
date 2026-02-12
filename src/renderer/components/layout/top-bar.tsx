import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useSearchQuery } from "@/contexts/search-context"
import { FiltersDropdown } from "../wallpaper/filters-dropdown"
import { SortDropdown } from "../wallpaper/sort-dropdown"

// TODO: Move to wallpaper grid
export function TopBar() {
    const { searchQuery, setSearchQuery } = useSearchQuery()

    return (
        <header id="onboarding-topbar" className="flex justify-center px-10 pt-4 pb-2">
            <div className="flex items-center gap-3 w-full max-w-2xl rounded-xl ring-1 ring-border/50 bg-secondary/30 px-3 py-1.5">
                {/* Search Input */}
                <div className="group relative flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60 transition-colors duration-200 group-focus-within:text-primary" />
                    <Input
                        type="text"
                        placeholder="Search wallpapers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 w-full rounded-lg border-0 bg-transparent pl-9 pr-4 text-sm font-light tracking-wide text-foreground placeholder:text-muted-foreground/50 transition-all duration-300 focus:bg-secondary/50 focus:ring-0"
                    />
                </div>

                <div className="h-5 w-px bg-border/50" />

                {/* Filter & Sort Controls */}
                <div className="flex items-center gap-1.5">
                    <FiltersDropdown />
                    <SortDropdown />
                </div>
            </div>
        </header>
    )
}
