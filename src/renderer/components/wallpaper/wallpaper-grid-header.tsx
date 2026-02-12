import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useSearchQuery } from "@/contexts/search-context"
import { FiltersDropdown } from "./filters-dropdown"
import { SortDropdown } from "./sort-dropdown"
import { RefreshButton } from "./refresh-button"

interface GridHeaderProps {
    onRefresh: () => void
    isLoading: boolean
}

export function GridHeader({ onRefresh, isLoading }: GridHeaderProps) {
    const { searchQuery, setSearchQuery } = useSearchQuery()

    return (
        <div className="mb-6 space-y-4">
            <div className="flex flex-row items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Installed</h1>
                    <p className="text-muted-foreground">
                        Wallpapers downloaded to your system
                    </p>
                </div>
                <RefreshButton onClick={onRefresh} isLoading={isLoading} />
            </div>

            <div id="onboarding-topbar" className="flex items-center gap-3 max-w-xl mx-auto py-1.5">
                <div className="group relative flex-1 rounded-lg ring-1 ring-foreground/10 hover:ring-foreground/30 bg-secondary/50">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60 transition-colors duration-200 group-focus-within:text-primary" />
                    <Input
                        type="text"
                        placeholder="Search wallpapers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 w-full rounded-lg border-0 pl-9 pr-4 text-sm font-light tracking-wide text-foreground placeholder:text-muted-foreground/50 transition-all duration-300 focus:bg-secondary/50 focus:ring-0"
                    />
                </div>

                <div className="flex items-center gap-1.5">
                    <div className="rounded-lg ring-1 ring-foreground/10 hover:ring-foreground/30">
                        <FiltersDropdown />
                    </div>
                    <div className="rounded-lg ring-1 ring-foreground/10 hover:ring-foreground/30">
                        <SortDropdown />
                    </div>
                </div>
            </div>
        </div>
    )
}
