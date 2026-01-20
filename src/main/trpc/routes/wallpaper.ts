import { z } from 'zod'
import { trpc } from '../trpc'
import {
  scanWallpapers,
  getWallpaperProperties,
  applyWallpaper,
  stopWallpaper,
  takeScreenshot,
  checkBackendInstalled,
} from '../../services/wallpaper'

export const wallpaperRouter = trpc.router({
  // Check if linux-wallpaperengine is installed
  checkBackend: trpc.procedure.query(async () => {
    return { installed: await checkBackendInstalled() }
  }),

  // Scan for installed wallpapers
  scan: trpc.procedure.query(async () => {
    return scanWallpapers()
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
        properties: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return applyWallpaper(input)
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
