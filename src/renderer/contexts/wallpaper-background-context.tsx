import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import { trpc } from "@/lib/trpc"

interface WallpaperBackgroundState {
  backgroundUrl: string | null
  setSelectedUrl: (url: string | null) => void
}

const WallpaperBackgroundContext = createContext<WallpaperBackgroundState>({
  backgroundUrl: null,
  setSelectedUrl: () => null,
})

export function WallpaperBackgroundProvider({ children }: { children: ReactNode }) {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)

  const { data: activeWallpapers } = trpc.wallpaper.getActiveWallpaper.useQuery(undefined, {
    refetchInterval: 5000,
  })

  const activeUrl = useMemo(() => {
    const active = activeWallpapers?.[0]
    return active?.thumbnail ? `local-file://${active.thumbnail}` : null
  }, [activeWallpapers])

  const backgroundUrl = useMemo(() => selectedUrl ?? activeUrl, [selectedUrl, activeUrl])

  return (
    <WallpaperBackgroundContext.Provider value={{ backgroundUrl, setSelectedUrl }}>
      {children}
    </WallpaperBackgroundContext.Provider>
  )
}

export const useWallpaperBackground = () => useContext(WallpaperBackgroundContext)
