import { spawn, exec, type ChildProcess } from 'node:child_process'
import { promisify } from 'node:util'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { glob } from 'glob'
import Store from 'electron-store'
import { displayService } from './display'
import { settingsService } from './settings'
import { STEAM_PATHS, CACHE_TTL } from '../../shared/constants'

const execAsync = promisify(exec)

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

export interface GetWallpapersOptions {
  search?: string
  filter?: 'installed' | 'workshop' | 'all'
  refresh?: boolean
}

interface ActiveWallpapersStore {
  activeWallpapers: Record<string, ApplyWallpaperOptions>
}

// Store for per-wallpaper custom properties (keyed by wallpaper path)
interface WallpaperPropertiesStore {
  properties: Record<string, Record<string, string | number | boolean>>
}


class WallpaperService {
  private static instance: WallpaperService | null = null

  private wallpaperCache: Wallpaper[] | null = null
  private cacheTimestamp: number | null = null
  private runningProcesses: Map<string, ChildProcess> = new Map()
  private activeWallpapers: Map<string, ApplyWallpaperOptions> = new Map()
  private store: Store<ActiveWallpapersStore>
  private propertiesStore: Store<WallpaperPropertiesStore>

  private constructor() {
    this.store = new Store<ActiveWallpapersStore>({
      name: 'active-wallpapers',
      defaults: {
        activeWallpapers: {},
      },
    })
    this.propertiesStore = new Store<WallpaperPropertiesStore>({
      name: 'wallpaper-properties',
      defaults: {
        properties: {},
      },
    })
    this.restoreActiveWallpapers()
  }

  static getInstance(): WallpaperService {
    if (!WallpaperService.instance) {
      WallpaperService.instance = new WallpaperService()
    }
    return WallpaperService.instance
  }

  private restoreActiveWallpapers(): void {
    const stored = this.store.get('activeWallpapers')
    for (const [screen, options] of Object.entries(stored)) {
      this.activeWallpapers.set(screen, options)
    }
  }

  // Get saved properties for a specific wallpaper
  getWallpaperSavedProperties(wallpaperPath: string): Record<string, string | number | boolean> {
    const allProps = this.propertiesStore.get('properties')
    return allProps[wallpaperPath] ?? {}
  }

  // Save properties for a specific wallpaper and reapply if active
  async saveWallpaperProperties(wallpaperPath: string, properties: Record<string, string | number | boolean>): Promise<void> {
    const allProps = this.propertiesStore.get('properties')
    allProps[wallpaperPath] = properties
    this.propertiesStore.set('properties', allProps)

    // Reapply if this wallpaper is currently active
    await this.reapplyActiveWallpapers()
  }

  // Reset properties for a specific wallpaper and reapply if active
  async resetWallpaperProperties(wallpaperPath: string): Promise<void> {
    const allProps = this.propertiesStore.get('properties')
    delete allProps[wallpaperPath]
    this.propertiesStore.set('properties', allProps)

    // Reapply if this wallpaper is currently active
    await this.reapplyActiveWallpapers()
  }

  private saveActiveWallpapers(): void {
    const wallpapersObj: Record<string, ApplyWallpaperOptions> = {}
    for (const [screen, options] of this.activeWallpapers.entries()) {
      wallpapersObj[screen] = options
    }
    this.store.set('activeWallpapers', wallpapersObj)
  }

  private expandPath(p: string): string {
    if (p.startsWith('~')) {
      return path.join(process.env.HOME ?? '', p.slice(1))
    }
    return p
  }

  async checkBackendInstalled(): Promise<boolean> {
    try {
      await execAsync('which linux-wallpaperengine')
      return true
    } catch {
      return false
    }
  }

  private async scanWallpapers(): Promise<Wallpaper[]> {
    const workshopDirs: Set<string> = new Set()
    const wallpapers: Wallpaper[] = []
    const seen: Set<string> = new Set()

    // Search standard Steam paths
    for (const basePath of STEAM_PATHS) {
      const expanded = this.expandPath(basePath)

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
    const snapPaths = await glob(this.expandPath('~/snap/steam/*/.local/share/Steam'))
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

            // Calculate total file size using du command
            let fileSize = 0
            try {
              const { stdout } = await execAsync(`du -sb "${wallpaperPath}"`)
              fileSize = parseInt(stdout.split('\t')[0], 10) || 0
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
              type = typeMap[project.type.toLowerCase()] ?? 'scene'
            }

            // Build thumbnail path
            let thumbnail = ''
            if (project.preview) {
              thumbnail = path.join(wallpaperPath, project.preview)
            }

            // Get resolution from media files
            const resolution = await this.detectResolution(wallpaperPath)

            wallpapers.push({
              id: itemId,
              workshopId: itemId,
              title: project.title ?? 'Untitled',
              author: project.author ?? (project.workshopurl ? 'Workshop' : 'Unknown'),
              type,
              thumbnail,
              previewUrl: project.preview ? path.join(wallpaperPath, project.preview) : undefined,
              resolution,
              fileSize,
              tags: project.tags ?? [],
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

  private async detectResolution(wallpaperPath: string): Promise<{ width: number; height: number }> {
    try {
      const files = await fs.readdir(wallpaperPath)

      // Look for video files first
      const videoFile = files.find(f =>
        f.endsWith('.mp4') || f.endsWith('.webm') || f.endsWith('.avi') || f.endsWith('.mkv')
      )

      if (videoFile) {
        const videoPath = path.join(wallpaperPath, videoFile)
        const { stdout } = await execAsync(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${videoPath}"`)
        const [w, h] = stdout.trim().split(',')
        if (w && h) {
          return { width: parseInt(w, 10), height: parseInt(h, 10) }
        }
      } else {
        // Look for image files (excluding preview thumbnails)
        const imageFile = files.find(f =>
          (f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.bmp')) &&
          !f.toLowerCase().includes('preview')
        )

        if (imageFile) {
          const imagePath = path.join(wallpaperPath, imageFile)
          const { stdout } = await execAsync(`file "${imagePath}"`)
          const match = stdout.match(/(\d+)\s*x\s*(\d+)/)
          if (match) {
            return { width: parseInt(match[1], 10), height: parseInt(match[2], 10) }
          }
        }
      }
    } catch {
      // Keep 0x0 if detection fails
    }

    return { width: 0, height: 0 }
  }

  async getWallpapers(options: GetWallpapersOptions = {}): Promise<Wallpaper[]> {
    const { search, filter = 'all', refresh = false } = options

    // Check if we need to refresh cache
    const now = Date.now()
    const cacheExpired = !this.cacheTimestamp || (now - this.cacheTimestamp) > CACHE_TTL

    if (refresh || !this.wallpaperCache || cacheExpired) {
      this.wallpaperCache = await this.scanWallpapers()
      this.cacheTimestamp = now
    }

    let filtered = this.wallpaperCache

    // Apply filter
    if (filter === 'installed') {
      filtered = filtered.filter(w => w.installed)
    } else if (filter === 'workshop') {
      filtered = filtered.filter(w => !w.installed)
    }

    // Apply search
    if (search?.trim()) {
      const searchLower = search.toLowerCase().trim()
      filtered = filtered.filter(w =>
        w.title.toLowerCase().includes(searchLower) ||
        w.author.toLowerCase().includes(searchLower) ||
        w.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    return filtered
  }

  async getWallpaperProperties(backgroundPath: string): Promise<WallpaperProperty[]> {
    const properties: WallpaperProperty[] = []

    try {
      const { stdout, stderr } = await execAsync(`linux-wallpaperengine --list-properties "${backgroundPath}"`, {
        timeout: 10000,
      })

      // Combine stdout and stderr since the tool outputs to both
      const output = stdout + stderr
      const blocks = output.split(/\n(?=\w+\s*-\s*\w+)/)

      for (const block of blocks) {
        const lines = block.trim().split('\n')
        if (lines.length === 0) continue

        // Match header like "clockWeatherColor - color"
        const headerMatch = lines[0].match(/^(\w+)\s*-\s*(\w+)/)
        if (!headerMatch) continue

        const [, name, typeStr] = headerMatch
        const prop: Partial<WallpaperProperty> & { options?: { label: string; value: string }[] } = { name }

        for (const line of lines.slice(1)) {
          const trimmed = line.trim()

          // Parse label from "Text:" field (strip HTML tags)
          if (trimmed.startsWith('Text:')) {
            const rawText = trimmed.replace('Text:', '').trim()
            // Remove HTML tags like <strong>, <em>, <br>, <a>, etc.
            prop.label = rawText.replace(/<[^>]+>/g, '').trim()
          }
          // Parse value
          else if (trimmed.startsWith('Value:')) {
            const rawValue = trimmed.replace('Value:', '').trim()
            if (typeStr === 'boolean') {
              prop.value = rawValue === '1' || rawValue === 'true'
            } else if (typeStr === 'slider') {
              prop.value = parseFloat(rawValue)
            } else if (typeStr === 'color') {
              // Color values are comma-separated: "0.988235, 0.870588, 0.788235"
              const parts = rawValue.split(',').map(s => parseFloat(s.trim()))
              if (parts.length >= 3) {
                prop.value = {
                  r: parts[0],
                  g: parts[1],
                  b: parts[2],
                  a: parts[3] ?? 1,
                }
              }
            } else {
              prop.value = rawValue
            }
          }
          // Parse slider constraints
          else if (trimmed.startsWith('Min:')) {
            prop.min = parseFloat(trimmed.replace('Min:', '').trim())
          } else if (trimmed.startsWith('Max:')) {
            prop.max = parseFloat(trimmed.replace('Max:', '').trim())
          } else if (trimmed.startsWith('Step:')) {
            prop.step = parseFloat(trimmed.replace('Step:', '').trim())
          }
          // Parse combo options like "Lake = lake"
          else if (trimmed.includes(' = ')) {
            const optionMatch = trimmed.match(/^(.+?)\s*=\s*(.+)$/)
            if (optionMatch) {
              if (!prop.options) prop.options = []
              prop.options.push({
                label: optionMatch[1].trim(),
                value: optionMatch[2].trim(),
              })
            }
          }
        }

        const typeMap: Record<string, WallpaperProperty['type']> = {
          slider: 'slider',
          boolean: 'boolean',
          color: 'color',
          combo: 'combolist',
          combolist: 'combolist',
        }

        // Accept properties even without label, using name as fallback
        if (typeMap[typeStr] && prop.name) {
          properties.push({
            name: prop.name,
            type: typeMap[typeStr],
            label: prop.label ?? prop.name,
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

  async applyWallpaper(options: ApplyWallpaperOptions): Promise<{ success: boolean; error?: string }> {
    const args: string[] = []

    // Get saved properties for this wallpaper and merge with passed properties
    const savedProps = this.getWallpaperSavedProperties(options.backgroundId)
    const mergedProperties = { ...savedProps, ...options.properties }

    let targetScreen = options.screen
    if (options.windowed) {
      const { x, y, width, height } = options.windowed
      args.push('--window', `${x}x${y}x${width}x${height}`)
    } else {
      if (!targetScreen) {
        try {
          const displays = await displayService.detectDisplays()
          const primary = displays.find((d) => d.primary) ?? displays[0]
          if (primary) {
            targetScreen = primary.name
          }
        } catch {
          targetScreen = 'eDP-1'
        }
      }
      if (targetScreen) {
        args.push('--screen-root', targetScreen)
      }
    }

    args.push('--bg', options.backgroundId)

    if (options.silent) {
      args.push('--silent')
    } else if (options.volume !== undefined) {
      args.push('--volume', options.volume.toString())
    }

    if (options.noAutomute) args.push('--noautomute')
    if (options.noAudioProcessing) args.push('--no-audio-processing')
    if (options.fps) args.push('--fps', options.fps.toString())
    if (options.disableMouse) args.push('--disable-mouse')
    if (options.disableParallax) args.push('--disable-parallax')
    if (options.noFullscreenPause) args.push('--no-fullscreen-pause')
    if (options.scaling && options.scaling !== 'default') args.push('--scaling', options.scaling)

    // Apply saved + passed properties
    if (Object.keys(mergedProperties).length > 0) {
      for (const [key, value] of Object.entries(mergedProperties)) {
        args.push('--set-property', `${key}=${value}`)
      }
    }

    try {
      const screenKey = targetScreen ?? 'default'
      const existing = this.runningProcesses.get(screenKey)
      if (existing) {
        existing.kill()
        this.runningProcesses.delete(screenKey)
      }

      const proc = spawn('linux-wallpaperengine', args, {
        detached: true,
        stdio: 'ignore',
      })

      proc.unref()
      this.runningProcesses.set(screenKey, proc)
      this.activeWallpapers.set(screenKey, options)
      this.saveActiveWallpapers()

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to apply wallpaper',
      }
    }
  }

  async stopWallpaper(screen?: string): Promise<{ success: boolean }> {
    try {
      if (screen) {
        const proc = this.runningProcesses.get(screen)
        if (proc) {
          proc.kill()
          this.runningProcesses.delete(screen)
          this.activeWallpapers.delete(screen)
          this.saveActiveWallpapers()
        }
      } else {
        await execAsync('pkill -f linux-wallpaperengine')
        this.runningProcesses.clear()
        this.activeWallpapers.clear()
        this.saveActiveWallpapers()
      }
      return { success: true }
    } catch {
      return { success: true }
    }
  }

  getActiveWallpapers(): Map<string, ApplyWallpaperOptions> {
    return new Map(this.activeWallpapers)
  }

  async getActiveWallpapersWithTitles(): Promise<Array<{
    screen: string
    wallpaper: ApplyWallpaperOptions
    title: string
  }>> {
    const result: Array<{
      screen: string
      wallpaper: ApplyWallpaperOptions
      title: string
    }> = []

    const allWallpapers = await this.getWallpapers()

    for (const [screen, wallpaper] of this.activeWallpapers.entries()) {
      const cachedWallpaper = allWallpapers.find(w => w.path === wallpaper.backgroundId)
      const title = cachedWallpaper?.title ?? wallpaper.backgroundId.split('/').filter(Boolean).pop() ?? 'Unknown'
      result.push({ screen, wallpaper, title })
    }

    return result
  }

  async reapplyActiveWallpapers(): Promise<{ success: boolean; errors?: string[] }> {
    const errors: string[] = []
    const settings = await settingsService.loadSettings()

    for (const [screenKey, baseOptions] of this.activeWallpapers.entries()) {
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

      const result = await this.applyWallpaper(options)
      if (!result.success && result.error) {
        errors.push(`${screenKey}: ${result.error}`)
      }
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    }
  }

  async takeScreenshot(
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
}

// Export singleton instance
export const wallpaperService = WallpaperService.getInstance()
