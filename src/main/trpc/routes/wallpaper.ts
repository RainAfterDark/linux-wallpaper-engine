import { z } from 'zod'
import { trpc } from '../trpc'
import { wallpaperService, type ApplyWallpaperOptions } from '../../services/wallpaper'
import { settingsService } from '../../services/settings'

export const wallpaperRouter = trpc.router({
  // Check if linux-wallpaperengine is installed
  checkBackend: trpc.procedure.query(async () => {
    return { installed: await wallpaperService.checkBackendInstalled() }
  }),

  // Get all wallpapers
  getWallpapers: trpc.procedure
    .input(
      z.object({
        search: z.string().optional(),
        filter: z.enum(['installed', 'workshop', 'all']).optional(),
        refresh: z.boolean().default(false),
      }),
    )
    .query(async ({ input }) => {
      return wallpaperService.getWallpapers(input)
    }),

  // Get properties for a specific wallpaper
  getProperties: trpc.procedure
    .input(z.object({ path: z.string() }))
    .query(async ({ input }) => {
      return wallpaperService.getWallpaperProperties(input.path)
    }),

  // Apply a wallpaper
  setWallpaper: trpc.procedure
    .input(
      z.object({
        backgroundId: z.string(),
        screen: z.string().optional(),
        scaling: z.enum(['default', 'stretch', 'fit', 'fill']).optional(),
        fps: z.number().optional(),
        volume: z.number().min(0).max(100).optional(),
        silent: z.boolean().optional(),
        noAutomute: z.boolean().optional(),
        noAudioProcessing: z.boolean().optional(),
        disableMouse: z.boolean().optional(),
        disableParallax: z.boolean().optional(),
        noFullscreenPause: z.boolean().optional(),
        windowed: z
          .object({
            x: z.number(),
            y: z.number(),
            width: z.number(),
            height: z.number(),
          })
          .optional(),
        properties: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      // Load saved settings and merge with input (input takes priority)
      const settings = await settingsService.loadSettings()

      const options: ApplyWallpaperOptions = {
        backgroundId: input.backgroundId,
        screen: input.screen,
        // Use input values if provided, otherwise fall back to settings
        scaling: input.scaling ?? settings.defaultScaling,
        fps: input.fps ?? settings.fps,
        volume: input.volume ?? settings.volume,
        silent: input.silent ?? settings.silent,
        noAutomute: input.noAutomute ?? settings.noAutomute,
        noAudioProcessing: input.noAudioProcessing ?? !settings.audioProcessing,
        disableMouse: input.disableMouse ?? settings.disableMouse,
        disableParallax: input.disableParallax ?? settings.disableParallax,
        noFullscreenPause: input.noFullscreenPause ?? !settings.pauseOnFullscreen,
        windowed: input.windowed,
        properties: input.properties as Record<string, string | number | boolean> | undefined,
      }

      return wallpaperService.applyWallpaper(options)
    }),

  // Stop wallpaper(s)
  stopWalpaper: trpc.procedure
    .input(z.object({ screen: z.string().optional() }).optional())
    .mutation(async ({ input }) => {
      return wallpaperService.stopWallpaper(input?.screen)
    }),

  // Take a screenshot of a wallpaper
  screenshot: trpc.procedure
    .input(
      z.object({
        backgroundPath: z.string(),
        outputPath: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return wallpaperService.takeScreenshot(input.backgroundPath, input.outputPath)
    }),

  // Get currently active wallpapers
  getActiveWallpaper: trpc.procedure.query(async () => {
    return wallpaperService.getActiveWallpapersWithTitles()
  }),

  // Get saved properties for a wallpaper
  getSavedProperties: trpc.procedure
    .input(z.object({ path: z.string() }))
    .query(({ input }) => {
      return wallpaperService.getWallpaperSavedProperties(input.path)
    }),

  // Save properties for a wallpaper
  saveProperties: trpc.procedure
    .input(
      z.object({
        path: z.string(),
        properties: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
      }),
    )
    .mutation(async ({ input }) => {
      await wallpaperService.saveWallpaperProperties(input.path, input.properties)
      return { success: true }
    }),

  // Reset properties for a wallpaper
  resetProperties: trpc.procedure
    .input(z.object({ path: z.string() }))
    .mutation(async ({ input }) => {
      await wallpaperService.resetWallpaperProperties(input.path)
      return { success: true }
    }),

})
