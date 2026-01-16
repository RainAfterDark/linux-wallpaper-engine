import { createFileRoute } from "@tanstack/react-router"
import { Plus, Play, Clock, Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/playlists")({
    component: PlaylistsPage,
})

// TODO: Replace with real playlist data
const playlists: {
    id: string
    name: string
    wallpaperCount: number
    interval: string
    thumbnail: string
}[] = []

function PlaylistsPage() {
    return (
        <div className="p-6">
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Playlists</h1>
                    <p className="text-muted-foreground">
                        Create wallpaper rotations with custom timing
                    </p>
                </div>
                <Button size="sm" className="gap-2">
                    <Plus className="size-4" />
                    New Playlist
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {playlists.map((playlist) => (
                    <div
                        key={playlist.id}
                        className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-ring/50 hover:shadow-lg"
                    >
                        <div className="aspect-video overflow-hidden">
                            <img
                                src={playlist.thumbnail}
                                alt={playlist.name}
                                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        </div>

                        <div className="absolute inset-x-0 bottom-0 p-4">
                            <h3 className="font-semibold text-white">{playlist.name}</h3>
                            <div className="mt-1 flex items-center gap-3 text-sm text-white/70">
                                <span>{playlist.wallpaperCount} wallpapers</span>
                                <div className="flex items-center gap-1">
                                    <Clock className="size-3" />
                                    {playlist.interval}
                                </div>
                            </div>
                        </div>

                        <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button size="icon-sm" variant="secondary" className="size-8">
                                <Shuffle className="size-3.5" />
                            </Button>
                            <Button size="icon-sm" className="size-8">
                                <Play className="size-3.5" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
