import { Pause, Volume2, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"

export function StatusBar() {
    return (
        <footer className="flex h-10 items-center justify-between border-t border-border bg-background px-4">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Monitor className="size-3.5" />
                    <span>eDP-1</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-success" />
                    <span className="text-sm text-muted-foreground">
                        Active: Mountain Sunset
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-sm" className="size-7">
                    <Pause className="size-3.5" />
                </Button>
                <Button variant="ghost" size="icon-sm" className="size-7">
                    <Volume2 className="size-3.5" />
                </Button>
            </div>
        </footer>
    )
}
