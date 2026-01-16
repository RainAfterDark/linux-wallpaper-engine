import { createFileRoute } from "@tanstack/react-router"
import { Monitor, Plus, Settings2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/displays")({
    component: DisplaysPage,
})

// TODO: Replace with real monitor data from linux-wallpaperengine
const monitors: {
    id: string
    name: string
    resolution: string
    position: { x: number; y: number }
    wallpaper: { name: string; thumbnail: string } | null
    scaling: "fill" | "stretch" | "fit" | "default"
}[] = []

function DisplaysPage() {
    return (
        <div className="p-6">
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Displays</h1>
                    <p className="text-muted-foreground">
                        Configure wallpapers for each monitor
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Save className="size-4" />
                        Save Profile
                    </Button>
                </div>
            </div>

            <div className="mb-8 rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-sm font-medium text-muted-foreground">
                    Monitor Layout
                </h2>
                <div className="flex items-center justify-center gap-4 py-8">
                    {monitors.map((monitor) => (
                        <div
                            key={monitor.id}
                            className="group relative overflow-hidden rounded-lg border-2 border-border bg-secondary/50 transition-all hover:border-ring"
                            style={{
                                width: monitor.resolution === "2560x1440" ? 200 : 160,
                                height: monitor.resolution === "2560x1440" ? 112 : 90,
                            }}
                        >
                            {monitor.wallpaper ? (
                                <img
                                    src={monitor.wallpaper.thumbnail}
                                    alt={monitor.wallpaper.name}
                                    className="size-full object-cover"
                                />
                            ) : (
                                <div className="flex size-full items-center justify-center">
                                    <Plus className="size-8 text-muted-foreground/50" />
                                </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                <p className="text-xs font-medium text-white">{monitor.id}</p>
                            </div>
                            <div className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100">
                                <Button size="icon-sm" variant="secondary" className="size-6">
                                    <Settings2 className="size-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Display Settings</h2>
                {monitors.map((monitor) => (
                    <div
                        key={monitor.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                                <Monitor className="size-5 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="font-medium">{monitor.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {monitor.id} - {monitor.resolution}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-medium">
                                    {monitor.wallpaper?.name ?? "No wallpaper"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Scaling: {monitor.scaling}
                                </p>
                            </div>
                            <Button variant="outline" size="sm">
                                Change
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
