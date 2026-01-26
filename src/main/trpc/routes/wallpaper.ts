import { z } from 'zod'
import { trpc } from '../trpc'
import {
  getWallpapers,
  getWallpaperProperties,
  applyWallpaper,
  stopWallpaper,
  takeScreenshot,
  checkBackendInstalled,
  type ApplyWallpaperOptions,
} from '../../services/wallpaper'
import { loadSettings } from '../../services/settings'

export const wallpaperRouter = trpc.router({
  // Check if linux-wallpaperengine is installed
  checkBackend: trpc.procedure.query(async () => {
    return { installed: await checkBackendInstalled() }
  }),

  // Get wallpapers with infinite scroll support
  getWallpapers: trpc.procedure
    .input(
      z.object({
        search: z.string().optional(),
        filter: z.enum(['installed', 'workshop', 'all']).optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.number().min(0).default(0),
        refresh: z.boolean().default(false),
      }),
    )
    .query(async ({ input }) => {
      return getWallpapers(input)
    }),

  // Get properties for a specific wallpaper
  getProperties: trpc.procedure
    .input(z.object({ path: z.string() }))
    .query(async ({ input }) => {
      return getWallpaperProperties(input.path)
    }),

  // Apply a wallpaper
  set: trpc.procedure
    .input(
      z.object({
        backgroundId: z.string(),
        screen: z.string().optional(),
        scaling: z.enum(['default', 'stretch', 'fit', 'fill']).optional(),
        fps: z.number().min(1).max(144).optional(),
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
      const settings = await loadSettings()

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

      return applyWallpaper(options)
    }),

  // Stop wallpaper(s)
  stop: trpc.procedure
    .input(z.object({ screen: z.string().optional() }).optional())
    .mutation(async ({ input }) => {
      return stopWallpaper(input?.screen)
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
      return takeScreenshot(input.backgroundPath, input.outputPath)
    }),
})
