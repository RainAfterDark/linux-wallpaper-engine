import { trpc } from '../trpc'
import { detectDisplays, getDisplaySession, getMaxRefreshRate } from '../../services/display'

export const displayRouter = trpc.router({
  // List all connected displays
  list: trpc.procedure.query(async () => {
    return detectDisplays()
  }),

  // Get current display session type
  session: trpc.procedure.query(async () => {
    return { type: await getDisplaySession() }
  }),

  // Get maximum refresh rate across all displays
  maxRefreshRate: trpc.procedure.query(async () => {
    return { maxRefreshRate: await getMaxRefreshRate() }
  }),
})
