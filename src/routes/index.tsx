import { createFileRoute } from "@tanstack/react-router"
import { WallpaperGrid } from "@/components/wallpaper/WallpaperGrid"

export const Route = createFileRoute("/")({
    component: InstalledPage,
})

function InstalledPage() {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Installed</h1>
                <p className="text-muted-foreground">
                    Wallpapers downloaded to your system
                </p>
            </div>
            <WallpaperGrid filter="installed" />
        </div>
    )
}
