import { trpc } from '../trpc'
import { detectDisplays, getDisplaySession } from '../../services/display'

export const displayRouter = trpc.router({
  // List all connected displays
  list: trpc.procedure.query(async () => {
    return detectDisplays()
  }),

  // Get current display session type
  session: trpc.procedure.query(async () => {
    return { type: await getDisplaySession() }
  }),
})
