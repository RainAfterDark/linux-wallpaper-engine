import { Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
export function TopBar() {
    return (
        <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
            <div className="flex flex-1 items-center gap-4">
                <div className="relative max-w-md flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search wallpapers..."
                        className="h-9 w-full rounded-lg border border-input bg-secondary/50 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <SlidersHorizontal className="size-4" />
                        Filters
                    </Button>
                </div>
            </div>

        </header>
    )
}

