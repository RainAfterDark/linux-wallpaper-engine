import { trpc } from '../trpc'
import { displayService } from '../../services/display'

export const displayRouter = trpc.router({
  // List all connected displays
  list: trpc.procedure.query(async () => {
    return displayService.detectDisplays()
  }),

  // Get current display session type
  session: trpc.procedure.query(async () => {
    return { type: await displayService.getDisplaySession() }
  }),

  // Get maximum refresh rate across all displays
  maxRefreshRate: trpc.procedure.query(async () => {
    return { maxRefreshRate: await displayService.getMaxRefreshRate() }
  }),
})
