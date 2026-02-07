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

  // Get per-wallpaper setting overrides
  getOverrides: trpc.procedure
    .input(z.object({ path: z.string() }))
    .query(({ input }) => {
      return wallpaperService.getWallpaperOverrides(input.path)
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
      }),
    )
    .mutation(async ({ input }) => {
      // Load saved settings and merge with input (input takes priority)
      const settings = await settingsService.loadSettings()

      const options: ApplyWallpaperOptions = {
        backgroundId: input.backgroundId,
        screen: input.screen,
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

  // Save per-wallpaper setting overrides
  saveOverrides: trpc.procedure
    .input(
      z.object({
        path: z.string(),
        overrides: z.object({
          volume: z.number().min(0).max(100).optional(),
          audioProcessing: z.boolean().optional(),
          scaling: z.enum(['default', 'stretch', 'fit', 'fill']).optional(),
          disableMouse: z.boolean().optional(),
          disableParallax: z.boolean().optional(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      await wallpaperService.saveWallpaperOverrides(input.path, input.overrides)
      return { success: true }
    }),

  // Reset per-wallpaper setting overrides
  resetOverrides: trpc.procedure
    .input(z.object({ path: z.string() }))
    .mutation(async ({ input }) => {
      await wallpaperService.resetWallpaperOverrides(input.path)
      return { success: true }
    }),

})
