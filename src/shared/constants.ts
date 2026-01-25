// Shared constants used across main and renderer processes

export interface AppSettings {
  // Performance settings (backend supported)
  fps: number
  pauseOnFullscreen: boolean

  // Audio settings (backend supported)
  volume: number
  silent: boolean
  noAutomute: boolean
  audioProcessing: boolean

  // Display settings (backend supported)
  defaultScaling: 'default' | 'stretch' | 'fit' | 'fill'
  disableMouse: boolean
  disableParallax: boolean

  // Paths (backend supported)
  assetsDir: string | null

  // App settings (not backend, managed by our app)
  theme: 'light' | 'dark' | 'system'
  launchOnLogin: boolean
  restoreLastWallpaper: boolean
  lastWallpaperId: string | null
  lastWallpaperScreen: string | null
}

export const DEFAULT_SETTINGS: AppSettings = {
  // Performance
  fps: 60,
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
  restoreLastWallpaper: true,
  lastWallpaperId: null,
  lastWallpaperScreen: null,
}

// Scaling options for display
export const SCALING_OPTIONS = ['default', 'stretch', 'fit', 'fill'] as const
export type ScalingOption = typeof SCALING_OPTIONS[number]

// Theme options
export const THEME_OPTIONS = ['light', 'dark', 'system'] as const
export type ThemeOption = typeof THEME_OPTIONS[number]

// FPS presets
export const FPS_PRESETS = [30, 60, 120, 144] as const

// App info
export const APP_NAME = 'Linux Wallpaper Engine'
export const APP_VERSION = '1.0.0'
