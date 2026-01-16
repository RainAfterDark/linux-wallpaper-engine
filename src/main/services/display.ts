import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

export interface Display {
  id: string
  name: string
  resolution: string
  width: number
  height: number
  x: number
  y: number
  primary: boolean
  connected: boolean
}

export async function detectDisplays(): Promise<Display[]> {
  const displays: Display[] = []

  // Try xrandr first (X11)
  try {
    const { stdout } = await execAsync('xrandr --query')
    const lines = stdout.split('\n')

    // Regex to match: Name connected [primary] WxH+X+Y ...
    const pattern = /^(\S+)\s+connected\s+(primary\s+)?(\d+)x(\d+)\+(\d+)\+(\d+)/

    for (const line of lines) {
      const match = line.match(pattern)
      if (match) {
        const [, name, primaryStr, width, height, x, y] = match
        displays.push({
          id: name,
          name,
          resolution: `${width}x${height}`,
          width: parseInt(width, 10),
          height: parseInt(height, 10),
          x: parseInt(x, 10),
          y: parseInt(y, 10),
          primary: !!primaryStr,
          connected: true,
        })
      }
    }

    if (displays.length > 0) {
      return displays
    }
  } catch {
    // xrandr not available or failed, try Wayland
  }

  // Try wlr-randr (Wayland with wlroots-based compositors)
  try {
    const { stdout } = await execAsync('wlr-randr')
    const lines = stdout.split('\n')

    let currentDisplay: Partial<Display> | null = null

    for (const line of lines) {
      // Output line: "eDP-1 \"AU Optronics 0x243D\" (1920x1080, scale 1.00)"
      const outputMatch = line.match(/^(\S+)\s+"[^"]*"\s+\((\d+)x(\d+)/)
      if (outputMatch) {
        if (currentDisplay && currentDisplay.name) {
          displays.push(currentDisplay as Display)
        }
        const [, name, width, height] = outputMatch
        currentDisplay = {
          id: name,
          name,
          resolution: `${width}x${height}`,
          width: parseInt(width, 10),
          height: parseInt(height, 10),
          x: 0,
          y: 0,
          primary: displays.length === 0, // First one is primary
          connected: true,
        }
      }

      // Position line: "Position: 0,0"
      if (currentDisplay) {
        const posMatch = line.match(/Position:\s*(\d+),(\d+)/)
        if (posMatch) {
          currentDisplay.x = parseInt(posMatch[1], 10)
          currentDisplay.y = parseInt(posMatch[2], 10)
        }
      }
    }

    if (currentDisplay && currentDisplay.name) {
      displays.push(currentDisplay as Display)
    }

    if (displays.length > 0) {
      return displays
    }
  } catch {
    // wlr-randr not available or failed
  }

  // Try gnome-randr for GNOME Wayland
  try {
    const { stdout } = await execAsync('gnome-randr query')
    // Parse gnome-randr output (format varies)
    const lines = stdout.split('\n')

    for (const line of lines) {
      // Basic parsing for connected displays
      const match = line.match(/^(\S+)\s+(\d+)x(\d+)\+(\d+)\+(\d+)/)
      if (match) {
        const [, name, width, height, x, y] = match
        displays.push({
          id: name,
          name,
          resolution: `${width}x${height}`,
          width: parseInt(width, 10),
          height: parseInt(height, 10),
          x: parseInt(x, 10),
          y: parseInt(y, 10),
          primary: displays.length === 0,
          connected: true,
        })
      }
    }

    if (displays.length > 0) {
      return displays
    }
  } catch {
    // gnome-randr not available
  }

  // Fallback: return a default display
  return [
    {
      id: 'default',
      name: 'Unknown Display',
      resolution: '1920x1080',
      width: 1920,
      height: 1080,
      x: 0,
      y: 0,
      primary: true,
      connected: true,
    },
  ]
}

export async function getDisplaySession(): Promise<'x11' | 'wayland' | 'unknown'> {
  const sessionType = process.env.XDG_SESSION_TYPE?.toLowerCase()

  if (sessionType === 'x11') return 'x11'
  if (sessionType === 'wayland') return 'wayland'

  // Try to detect from DISPLAY/WAYLAND_DISPLAY env vars
  if (process.env.WAYLAND_DISPLAY) return 'wayland'
  if (process.env.DISPLAY) return 'x11'

  return 'unknown'
}
