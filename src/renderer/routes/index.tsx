import { createFileRoute } from "@tanstack/react-router"
import { WallpaperGrid } from "@/components/wallpaper/wallpaper-grid"
import { trpc } from "@/lib/trpc"

export const Route = createFileRoute("/")({
    component: InstalledPage,
})

function InstalledPage() {
    const { data, error, isLoading } = trpc.health.useQuery()
    console.log('tRPC health query:', { data, error, isLoading })
    return (
        <div className="h-full p-6">
            <WallpaperGrid filter="installed" />
        </div>
    )
}
