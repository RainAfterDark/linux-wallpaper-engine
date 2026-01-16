import { createFileRoute } from "@tanstack/react-router"
import { WallpaperGrid } from "@/components/wallpaper/WallpaperGrid"
import { trpc } from "@/lib/trpc"

export const Route = createFileRoute("/")({
    component: InstalledPage,
})

function InstalledPage() {
    const { data, error, isLoading } = trpc.health.useQuery()
    console.log('tRPC health query:', { data, error, isLoading })
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
