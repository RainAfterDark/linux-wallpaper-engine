import { useWallpaperBackground } from "@/contexts/wallpaper-background-context"
import { useStaticFrame } from "@/hooks/use-static-frame"
import { AnimatePresence, motion } from "framer-motion"

const backgroundOverlay = <div className="absolute inset-0 bg-background/30" />

export function WallpaperBackground() {
  const { backgroundUrl } = useWallpaperBackground()
  const staticUrl = useStaticFrame(backgroundUrl)

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <AnimatePresence mode="popLayout">
        {staticUrl && (
          <motion.img
            key={staticUrl}
            src={staticUrl}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 size-full scale-110 object-cover blur-2xl saturate-[0.5]"
          />
        )}
      </AnimatePresence>
      {backgroundOverlay}
    </div>
  )
}
