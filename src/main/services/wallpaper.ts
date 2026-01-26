import { spawn, exec } from 'node:child_process'
import { promisify } from 'node:util'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { glob } from 'glob'
import { detectDisplays } from './display'
import { loadSettings } from './settings'

const execAsync = promisify(exec)

// In-memory cache
let wallpaperCache: Wallpaper[] | null = null
let cacheTimestamp: number | null = null
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Types
export interface Wallpaper {
  id: string
  workshopId?: string
  title: string
  author: string
  type: 'scene' | 'video' | 'web' | 'application'
  thumbnail: string
  previewUrl?: string
  resolution: { width: number; height: number }
  fileSize: number
  tags: string[]
  installed: boolean
  path: string
}

export interface WallpaperProperty {
  name: string
  type: 'slider' | 'boolean' | 'color' | 'combolist'
  label: string
  value: number | boolean | { r: number; g: number; b: number; a: number } | string
  min?: number
  max?: number
  step?: number
  options?: { label: string; value: string }[]
}

export interface ApplyWallpaperOptions {
  backgroundId: string
  screen?: string
  scaling?: 'default' | 'stretch' | 'fit' | 'fill'
  fps?: number
  volume?: number
  silent?: boolean
  noAutomute?: boolean
  noAudioProcessing?: boolean
  disableMouse?: boolean
  disableParallax?: boolean
  noFullscreenPause?: boolean
  windowed?: { x: number; y: number; width: number; height: number }
  properties?: Record<string, string | number | boolean>
}

// Track running wallpaper processes and their configs
const runningProcesses: Map<string, ReturnType<typeof spawn>> = new Map()
const activeWallpapers: Map<string, ApplyWallpaperOptions> = new Map()

// Steam paths to search for wallpapers
const STEAM_PATHS = [
  '~/.local/share/Steam',
  '~/.steam/steam',
  '~/.var/app/com.valvesoftware.Steam/.local/share/Steam',
  '~/.var/app/com.valvesoftware.Steam/.data/Steam',
  '~/.var/app/com.valvesoftware.Steam/.steam/steam',
]

function expandPath(p: string): string {
  if (p.startsWith('~')) {
    return path.join(process.env.HOME || '', p.slice(1))
  }
  return p
}

export async function checkBackendInstalled(): Promise<boolean> {
  try {
    await execAsync('which linux-wallpaperengine')
    return true
  } catch {
    return false
  }
}

async function scanWallpapersInternal(): Promise<Wallpaper[]> {
  const workshopDirs: Set<string> = new Set()
  const wallpapers: Wallpaper[] = []
  const seen: Set<string> = new Set()

  // Search standard Steam paths
  for (const basePath of STEAM_PATHS) {
    const expanded = expandPath(basePath)

    // Workshop content (431960 is Wallpaper Engine's Steam app ID)
    const workshopPath = path.join(expanded, 'steamapps/workshop/content/431960')
    try {
      await fs.access(workshopPath)
      workshopDirs.add(workshopPath)
    } catch {
      // Path doesn't exist, skip
    }

    // Default presets
    const presetsPath = path.join(expanded, 'steamapps/common/wallpaper_engine/assets/presets')
    try {
      await fs.access(presetsPath)
      workshopDirs.add(presetsPath)
    } catch {
      // Path doesn't exist, skip
    }
  }

  // Also check snap paths dynamically
  const snapPaths = await glob(expandPath('~/snap/steam/*/.local/share/Steam'))
  for (const snapPath of snapPaths) {
    const workshopPath = path.join(snapPath, 'steamapps/workshop/content/431960')
    try {
      await fs.access(workshopPath)
      workshopDirs.add(workshopPath)
    } catch {
      // Skip
    }
  }

  // Scan each workshop directory for wallpapers
  for (const workshopDir of workshopDirs) {
    try {
      const items = await fs.readdir(workshopDir)

      for (const itemId of items) {
        if (seen.has(itemId)) continue

        const wallpaperPath = path.join(workshopDir, itemId)
        const projectFile = path.join(wallpaperPath, 'project.json')

        try {
          const projectData = await fs.readFile(projectFile, 'utf-8')
          const project = JSON.parse(projectData)

          // Get file size
          let fileSize = 0
          try {
            const stats = await fs.stat(wallpaperPath)
            fileSize = stats.size
          } catch {
            // Ignore size errors
          }

          // Determine wallpaper type
          let type: Wallpaper['type'] = 'scene'
          if (project.type) {
            const typeMap: Record<string, Wallpaper['type']> = {
              scene: 'scene',
              video: 'video',
              web: 'web',
              application: 'application',
            }
            type = typeMap[project.type.toLowerCase()] || 'scene'
          }

          // Build thumbnail path
          let thumbnail = ''
          if (project.preview) {
            thumbnail = path.join(wallpaperPath, project.preview)
          }

          wallpapers.push({
            id: itemId,
            workshopId: itemId,
            title: project.title || 'Untitled',
            author: project.author || project.workshopurl ? 'Workshop' : 'Unknown',
            type,
            thumbnail,
            previewUrl: project.preview ? path.join(wallpaperPath, project.preview) : undefined,
            resolution: {
              width: project.general?.properties?.schemecolor?.width || 1920,
              height: project.general?.properties?.schemecolor?.height || 1080,
            },
            fileSize,
            tags: project.tags || [],
            installed: true,
            path: wallpaperPath,
          })

          seen.add(itemId)
        } catch {
          // Skip wallpapers without valid project.json
        }
      }
    } catch {
      // Skip directories we can't read
    }
  }

  // Sort by title
  wallpapers.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()))

  return wallpapers
}

export interface GetWallpapersOptions {
  search?: string
  filter?: 'installed' | 'workshop' | 'all'
  limit?: number
  cursor?: number
  refresh?: boolean
}

export interface GetWallpapersResult {
  wallpapers: Wallpaper[]
  nextCursor?: number
  hasMore: boolean
  total: number
}

export async function getWallpapers(options: GetWallpapersOptions = {}): Promise<GetWallpapersResult> {
  const { search, filter = 'all', limit = 50, cursor = 0, refresh = false } = options

  // Check if we need to refresh cache
  const now = Date.now()
  const cacheExpired = !cacheTimestamp || (now - cacheTimestamp) > CACHE_TTL

  if (refresh || !wallpaperCache || cacheExpired) {
    wallpaperCache = await scanWallpapersInternal()
    cacheTimestamp = now
  }

  let filtered = wallpaperCache

  // Apply filter
  if (filter === 'installed') {
    filtered = filtered.filter(w => w.installed)
  } else if (filter === 'workshop') {
    filtered = filtered.filter(w => !w.installed)
  }

  // Apply search
  if (search && search.trim()) {
    const searchLower = search.toLowerCase().trim()
    filtered = filtered.filter(w => 
      w.title.toLowerCase().includes(searchLower) ||
      w.author.toLowerCase().includes(searchLower) ||
      w.tags.some(tag => tag.toLowerCase().includes(searchLower))
    )
  }

  const total = filtered.length
  const hasMore = cursor + limit < total
  const wallpapers = filtered.slice(cursor, cursor + limit)
  const nextCursor = hasMore ? cursor + limit : undefined

  return {
    wallpapers,
    nextCursor,
    hasMore,
    total,
  }
}

export async function getWallpaperProperties(backgroundPath: string): Promise<WallpaperProperty[]> {
  const properties: WallpaperProperty[] = []

  try {
    const { stdout } = await execAsync(`linux-wallpaperengine --list-properties "${backgroundPath}"`)

    // Parse the output format from linux-wallpaperengine
    // Example:
    // barcount - slider
    //   Description: Bar Count
    //   Value: 64
    //   Minimum value: 16
    //   Maximum value: 64
    //   Step: 1

    const blocks = stdout.split(/\n(?=\w)/)

    for (const block of blocks) {
      const lines = block.trim().split('\n')
      if (lines.length === 0) continue

      const headerMatch = lines[0].match(/^(\w+)\s*-\s*(\w+)/)
      if (!headerMatch) continue

      const [, name, typeStr] = headerMatch
      const prop: Partial<WallpaperProperty> = { name }

      // Parse properties from indented lines
      for (const line of lines.slice(1)) {
        const trimmed = line.trim()
        if (trimmed.startsWith('Description:')) {
          prop.label = trimmed.replace('Description:', '').trim()
        } else if (trimmed.startsWith('Value:')) {
          const rawValue = trimmed.replace('Value:', '').trim()
          if (typeStr === 'boolean') {
            prop.value = rawValue === '1' || rawValue === 'true'
          } else if (typeStr === 'slider') {
            prop.value = parseFloat(rawValue)
          } else {
            prop.value = rawValue
          }
        } else if (trimmed.startsWith('Minimum value:')) {
          prop.min = parseFloat(trimmed.replace('Minimum value:', '').trim())
        } else if (trimmed.startsWith('Maximum value:')) {
          prop.max = parseFloat(trimmed.replace('Maximum value:', '').trim())
        } else if (trimmed.startsWith('Step:')) {
          prop.step = parseFloat(trimmed.replace('Step:', '').trim())
        } else if (trimmed.startsWith('R:')) {
          // Color property: R: 0.14902 G: 0.23137 B: 0.4 A: 1
          const colorMatch = trimmed.match(/R:\s*([\d.]+)\s*G:\s*([\d.]+)\s*B:\s*([\d.]+)\s*A:\s*([\d.]+)/)
          if (colorMatch) {
            prop.value = {
              r: parseFloat(colorMatch[1]),
              g: parseFloat(colorMatch[2]),
              b: parseFloat(colorMatch[3]),
              a: parseFloat(colorMatch[4]),
            }
          }
        }
      }

      // Map type string to our type
      const typeMap: Record<string, WallpaperProperty['type']> = {
        slider: 'slider',
        boolean: 'boolean',
        color: 'color',
        combolist: 'combolist',
      }

      if (typeMap[typeStr] && prop.name && prop.label !== undefined) {
        properties.push({
          name: prop.name,
          type: typeMap[typeStr],
          label: prop.label || prop.name,
          value: prop.value ?? (typeStr === 'boolean' ? false : 0),
          ...(prop.min !== undefined && { min: prop.min }),
          ...(prop.max !== undefined && { max: prop.max }),
          ...(prop.step !== undefined && { step: prop.step }),
          ...(prop.options && { options: prop.options }),
        } as WallpaperProperty)
      }
    }
  } catch (error) {
    console.error('Failed to get wallpaper properties:', error)
  }

  return properties
}

export async function applyWallpaper(options: ApplyWallpaperOptions): Promise<{ success: boolean; error?: string }> {
  const args: string[] = []

  // Screen targeting - always require a screen for desktop background
  let targetScreen = options.screen
  if (options.windowed) {
    const { x, y, width, height } = options.windowed
    args.push('--window', `${x}x${y}x${width}x${height}`)
  } else {
    // If no screen specified, detect and use the primary/first display
    if (!targetScreen) {
      try {
        const displays = await detectDisplays()
        const primary = displays.find((d) => d.primary) || displays[0]
        if (primary) {
          targetScreen = primary.name
        }
      } catch {
        // Fallback to common display name
        targetScreen = 'eDP-1'
      }
    }
    if (targetScreen) {
      args.push('--screen-root', targetScreen)
    }
  }

  // Background ID/path
  args.push('--bg', options.backgroundId)

  // Audio options
  if (options.silent) {
    args.push('--silent')
  } else if (options.volume !== undefined) {
    args.push('--volume', options.volume.toString())
  }

  if (options.noAutomute) {
    args.push('--noautomute')
  }

  if (options.noAudioProcessing) {
    args.push('--no-audio-processing')
  }

  // Performance options
  if (options.fps) {
    args.push('--fps', options.fps.toString())
  }

  if (options.disableMouse) {
    args.push('--disable-mouse')
  }

  if (options.disableParallax) {
    args.push('--disable-parallax')
  }

  if (options.noFullscreenPause) {
    args.push('--no-fullscreen-pause')
  }

  // Scaling
  if (options.scaling && options.scaling !== 'default') {
    args.push('--scaling', options.scaling)
  }

  // Custom properties
  if (options.properties) {
    for (const [key, value] of Object.entries(options.properties)) {
      args.push('--set-property', `${key}=${value}`)
    }
  }

  try {
    // Stop existing wallpaper for this screen if any
    const screenKey = targetScreen || 'default'
    const existing = runningProcesses.get(screenKey)
    if (existing) {
      existing.kill()
      runningProcesses.delete(screenKey)
    }

    // Spawn new wallpaper process
    const proc = spawn('linux-wallpaperengine', args, {
      detached: true,
      stdio: 'ignore',
    })

    proc.unref()
    runningProcesses.set(screenKey, proc)

    // Store the wallpaper config for reapplying later
    activeWallpapers.set(screenKey, options)

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to apply wallpaper',
    }
  }
}

export async function stopWallpaper(screen?: string): Promise<{ success: boolean }> {
  try {
    if (screen) {
      const proc = runningProcesses.get(screen)
      if (proc) {
        proc.kill()
        runningProcesses.delete(screen)
        activeWallpapers.delete(screen)
      }
    } else {
      // Stop all wallpapers
      await execAsync('pkill -f linux-wallpaperengine')
      runningProcesses.clear()
      activeWallpapers.clear()
    }
    return { success: true }
  } catch {
    return { success: true } // pkill returns error if no process found, which is fine
  }
}

// Get currently active wallpapers
export function getActiveWallpapers(): Map<string, ApplyWallpaperOptions> {
  return new Map(activeWallpapers)
}

// Reapply all active wallpapers with current global settings
export async function reapplyActiveWallpapers(): Promise<{ success: boolean; errors?: string[] }> {
  const errors: string[] = []

  // Get current global settings
  const settings = await loadSettings()

  for (const [screenKey, baseOptions] of activeWallpapers.entries()) {
    // Merge global settings into the wallpaper options
    const options: ApplyWallpaperOptions = {
      ...baseOptions,
      fps: settings.fps,
      volume: settings.volume,
      silent: settings.silent,
      noAutomute: settings.noAutomute,
      noAudioProcessing: !settings.audioProcessing,
      scaling: settings.defaultScaling,
      disableMouse: settings.disableMouse,
      disableParallax: settings.disableParallax,
      noFullscreenPause: !settings.pauseOnFullscreen,
    }

    const result = await applyWallpaper(options)
    if (!result.success && result.error) {
      errors.push(`${screenKey}: ${result.error}`)
    }
  }

  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  }
}

export async function takeScreenshot(
  backgroundPath: string,
  outputPath: string,
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    await execAsync(`linux-wallpaperengine --screenshot "${outputPath}" "${backgroundPath}"`)
    return { success: true, path: outputPath }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to take screenshot',
    }
  }
}
