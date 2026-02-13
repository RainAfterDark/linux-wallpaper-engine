import { BrowserWindow } from 'electron'
import { trpc } from '../trpc'

// TODO: Add a window service for more controls like minimize, restore, close, etc.
export const windowRouter = trpc.router({
  maximize: trpc.procedure.mutation(() => {
    const win = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0]
    if (win && !win.isMaximized()) {
      win.maximize()
    }
    return { success: true }
  }),
})
