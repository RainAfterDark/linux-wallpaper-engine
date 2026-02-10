// Shared constants used across main and renderer processes

// Scaling options for display
export const SCALING_OPTIONS = [
  { label: 'Default', value: 'default' },
  { label: 'Fill', value: 'fill' },
  { label: 'Fit', value: 'fit' },
  { label: 'Stretch', value: 'stretch' },
] as const
export type ScalingOption = typeof SCALING_OPTIONS[number]['value']

export const THEME_OPTIONS = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'Steam', value: 'steam' },
] as const
export type ThemeOption = typeof THEME_OPTIONS[number]['value']

// Wallpaper compatibility status
export const COMPATIBILITY_OPTIONS = [
  { label: 'Unknown', value: 'unknown', color: 'gray', textColor: 'text-muted-foreground', bgColor: 'bg-muted-foreground/50' },
  { label: 'Broken', value: 'broken', color: 'red', textColor: 'text-red-500', bgColor: 'bg-red-500' },
  { label: 'Major Issues', value: 'major', color: 'orange', textColor: 'text-orange-500', bgColor: 'bg-orange-500' },
  { label: 'Minor Issues', value: 'minor', color: 'yellow', textColor: 'text-yellow-500', bgColor: 'bg-yellow-500' },
  { label: 'Perfect', value: 'perfect', color: 'green', textColor: 'text-green-500', bgColor: 'bg-green-500' },
] as const
export type CompatibilityStatus = typeof COMPATIBILITY_OPTIONS[number]['value']

// Lookup map keyed by status value for quick access
export const COMPATIBILITY_CONFIG = Object.fromEntries(
  COMPATIBILITY_OPTIONS.map(opt => [opt.value, opt])
) as Record<CompatibilityStatus, typeof COMPATIBILITY_OPTIONS[number]>

// Filter & sort types
export type WallpaperFilterType = 'all' | 'scene' | 'video' | 'web' | 'application'
export type SortBy = 'name' | 'size' | 'recent'
export type SortOrder = 'asc' | 'desc'

export interface AppSettings {
  // Performance settings (backend supported)
  fps: number
  maxRefreshRate: number | null // null means auto-detect
  pauseOnFullscreen: boolean

  // Audio settings (backend supported)
  volume: number
  silent: boolean
  noAutomute: boolean
  audioProcessing: boolean

  // Display settings (backend supported)
  defaultScaling: ScalingOption
  disableMouse: boolean
  disableParallax: boolean

  // Paths (backend supported)
  assetsDir: string | null

  // App settings (not backend, managed by our app)
  theme: ThemeOption
  launchOnLogin: boolean
  minimizeOnClose: boolean
  restoreLastWallpaper: boolean
  lastWallpaperId: string | null
  lastWallpaperScreen: string | null
  showCompatibilityDot: boolean
  showStatusBar: boolean
  onboardingComplete: boolean
  dismissedScanReminder: boolean

  // Persisted filter & sort preferences
  filterType: WallpaperFilterType
  filterTags: string[]
  filterCompatibility: CompatibilityStatus[]
  sortBy: SortBy
  sortOrder: SortOrder
}

export const DEFAULT_SETTINGS: AppSettings = {
  // Performance
  fps: 60,
  maxRefreshRate: null, // Auto-detect from display
  pauseOnFullscreen: true,

  // Audio
  volume: 100,
  silent: false,
  noAutomute: false,
  audioProcessing: true,

  // Display
  defaultScaling: 'fill',
  disableMouse: false,
  disableParallax: false,

  // Paths
  assetsDir: null,

  // App
  theme: 'system',
  launchOnLogin: false,
  minimizeOnClose: false,
  restoreLastWallpaper: true,
  lastWallpaperId: null,
  lastWallpaperScreen: null,
  showCompatibilityDot: true,
  showStatusBar: false,
  onboardingComplete: false,
  dismissedScanReminder: false,

  // Filters & sort
  filterType: 'all',
  filterTags: [],
  filterCompatibility: [],
  sortBy: 'name',
  sortOrder: 'asc',
}



// FPS presets - base options that will be filtered based on display capabilities
export const BASE_FPS_OPTIONS = [30, 60, 90, 120, 144, 165, 240, 360] as const
export type BaseFpsOption = typeof BASE_FPS_OPTIONS[number]

/**
 * Generate FPS options based on the maximum refresh rate
 * @param maxRefreshRate - Maximum refresh rate from displays
 * @param currentFps - Current FPS value to ensure it's included in options
 * @returns Array of FPS options that don't exceed the max refresh rate, with max as final option
 */
export function getFpsOptions(maxRefreshRate: number, currentFps?: number): number[] {
  const filtered = BASE_FPS_OPTIONS.filter(fps => fps <= maxRefreshRate)
  const options: Set<number> = new Set(filtered)

  // Add the max refresh rate if it's not already included
  if (maxRefreshRate > 0) {
    options.add(maxRefreshRate)
  }

  // Ensure current FPS is always included (important for maintaining selection)
  if (currentFps && currentFps > 0) {
    options.add(currentFps)
  }

  return Array.from(options).sort((a, b) => a - b)
}

// Per-wallpaper setting overrides (all optional, falls back to global settings)
export interface WallpaperOverrides {
  volume?: number
  audioProcessing?: boolean
  scaling?: ScalingOption
  disableMouse?: boolean
  disableParallax?: boolean
  compatibility?: CompatibilityStatus
  autoErrors?: string[]
  lastTested?: number
}

// App info
export const APP_NAME = 'Linux Wallpaper Engine'
export const APP_VERSION = '1.0.0'


// Steam paths to search for wallpapers
export const STEAM_PATHS = [
  '~/.local/share/Steam',
  '~/.steam/steam',
  '~/.var/app/com.valvesoftware.Steam/.local/share/Steam',
  '~/.var/app/com.valvesoftware.Steam/.data/Steam',
  '~/.var/app/com.valvesoftware.Steam/.steam/steam',
]

export const CACHE_TTL = 5 * 60 * 1000 // 5 minutes