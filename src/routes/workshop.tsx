import { createFileRoute } from "@tanstack/react-router"
import { WallpaperGrid } from "@/components/wallpaper/WallpaperGrid"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/workshop")({
    component: WorkshopPage,
})

function WorkshopPage() {
    return (
        <div className="p-6">
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Steam Workshop</h1>
                    <p className="text-muted-foreground">
                        Browse and download community wallpapers
                    </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="size-4" />
                    Open in Steam
                </Button>
            </div>
            <WallpaperGrid filter="workshop" />
        </div>
    )
}
