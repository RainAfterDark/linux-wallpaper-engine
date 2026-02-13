import { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { trpc } from './trpc'
import { wallpaperRouter } from './routes/wallpaper'
import { displayRouter } from './routes/display'
import { settingsRouter } from './routes/settings'
import { windowRouter } from './routes/window'

export const appRouter = trpc.router({
  health: trpc.procedure.query(() => ({ status: 'ok' })),
  wallpaper: wallpaperRouter,
  display: displayRouter,
  settings: settingsRouter,
  window: windowRouter,
})

export type AppRouter = typeof appRouter
export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>
