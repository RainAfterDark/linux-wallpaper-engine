import { z } from 'zod'
import { trpc } from '../trpc'
import {
  loadSettings,
  saveSettings,
  resetSettings,
  getDefaultSettings,
  type AppSettings,
} from '../../services/settings'
import { reapplyActiveWallpapers } from '../../services/wallpaper'

const settingsSchema = z.object({
  // Performance
  fps: z.number().min(1).max(144).optional(),
  pauseOnFullscreen: z.boolean().optional(),

  // Audio
  volume: z.number().min(0).max(100).optional(),
  silent: z.boolean().optional(),
  noAutomute: z.boolean().optional(),
  audioProcessing: z.boolean().optional(),

  // Display
  defaultScaling: z.enum(['default', 'stretch', 'fit', 'fill']).optional(),
  disableMouse: z.boolean().optional(),
  disableParallax: z.boolean().optional(),

  // Paths
  assetsDir: z.string().nullable().optional(),

  // App
  theme: z.enum(['light', 'dark', 'system']).optional(),
  launchOnLogin: z.boolean().optional(),
  restoreLastWallpaper: z.boolean().optional(),
  lastWallpaperId: z.string().nullable().optional(),
  lastWallpaperScreen: z.string().nullable().optional(),
})

export const settingsRouter = trpc.router({
  // Get all settings
  get: trpc.procedure.query(async (): Promise<AppSettings> => {
    return loadSettings()
  }),

  // Update settings (partial update)
  update: trpc.procedure
    .input(settingsSchema)
    .mutation(async ({ input }) => {
      const updated = await saveSettings(input)
      
      // Reapply active wallpapers with new settings
      await reapplyActiveWallpapers()
      
      return updated
    }),

  // Reset to defaults
  reset: trpc.procedure.mutation(async () => {
    const reset = await resetSettings()
    
    // Reapply active wallpapers with default settings
    await reapplyActiveWallpapers()
    
    return reset
  }),

  // Get default settings
  defaults: trpc.procedure.query(() => {
    return getDefaultSettings()
  }),
})
