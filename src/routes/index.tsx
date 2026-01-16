import { createFileRoute } from "@tanstack/react-router"
import { WallpaperGrid } from "@/components/wallpaper/WallpaperGrid"

export const Route = createFileRoute("/")(
  {
    component: DiscoverPage,
  })

function DiscoverPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Discover</h1>
        <p className="text-muted-foreground">
          Browse popular and trending wallpapers
        </p>
      </div>
      <WallpaperGrid />
    </div>
  )
}
