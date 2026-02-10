import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

interface WallpaperBackgroundState {
  backgroundUrl: string | null
  setActiveUrl: (url: string | null) => void
  setSelectedUrl: (url: string | null) => void
}

const WallpaperBackgroundContext = createContext<WallpaperBackgroundState>({
  backgroundUrl: null,
  setActiveUrl: () => null,
  setSelectedUrl: () => null,
})

export function WallpaperBackgroundProvider({ children }: { children: ReactNode }) {
  const [activeUrl, setActiveUrl] = useState<string | null>(null)
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)

  const backgroundUrl = useMemo(() => selectedUrl ?? activeUrl, [selectedUrl, activeUrl])

  return (
    <WallpaperBackgroundContext.Provider value={{ backgroundUrl, setActiveUrl, setSelectedUrl }}>
      {children}
    </WallpaperBackgroundContext.Provider>
  )
}

export const useWallpaperBackground = () => useContext(WallpaperBackgroundContext)
