import { z } from 'zod'
import { trpc } from '../trpc'
import { settingsService, type AppSettings } from '../../services/settings'
import { wallpaperService } from '../../services/wallpaper'

const settingsSchema = z.object({
  // Performance
  fps: z.number().optional(),
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
    return settingsService.loadSettings()
  }),

  // Update settings (partial update)
  update: trpc.procedure
    .input(settingsSchema)
    .mutation(async ({ input }) => {
      const updated = await settingsService.saveSettings(input)

      // Reapply active wallpapers with new settings
      await wallpaperService.reapplyActiveWallpapers()

      return updated
    }),

  // Reset to defaults
  reset: trpc.procedure.mutation(async () => {
    const reset = await settingsService.resetSettings()

    // Reapply active wallpapers with default settings
    await wallpaperService.reapplyActiveWallpapers()

    return reset
  }),

  // Get default settings
  defaults: trpc.procedure.query(() => {
    return settingsService.getDefaultSettings()
  }),
})
