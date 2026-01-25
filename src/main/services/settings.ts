import Store from 'electron-store'
import { DEFAULT_SETTINGS, type AppSettings } from '../../shared/constants'

export type { AppSettings }

const store = new Store<AppSettings>({
  name: 'settings',
  defaults: DEFAULT_SETTINGS,
})

export async function loadSettings(): Promise<AppSettings> {
  return store.store
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  for (const [key, value] of Object.entries(settings)) {
    store.set(key as keyof AppSettings, value)
  }
  return store.store
}

export async function resetSettings(): Promise<AppSettings> {
  store.clear()
  return store.store
}

export function getDefaultSettings(): AppSettings {
  return { ...DEFAULT_SETTINGS }
}

// Get a single setting value
export function getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
  return store.get(key)
}

// Set a single setting value
export function setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
  store.set(key, value)
}

// Convert settings to linux-wallpaperengine CLI args
export function settingsToArgs(settings: AppSettings): string[] {
  const args: string[] = []

  // FPS
  if (settings.fps && settings.fps !== 60) {
    args.push('--fps', settings.fps.toString())
  }

  // Fullscreen pause (inverted - flag means DON'T pause)
  if (!settings.pauseOnFullscreen) {
    args.push('--no-fullscreen-pause')
  }

  // Audio
  if (settings.silent) {
    args.push('--silent')
  } else if (settings.volume !== 100) {
    args.push('--volume', settings.volume.toString())
  }

  if (settings.noAutomute) {
    args.push('--noautomute')
  }

  if (!settings.audioProcessing) {
    args.push('--no-audio-processing')
  }

  // Display
  if (settings.defaultScaling && settings.defaultScaling !== 'default') {
    args.push('--scaling', settings.defaultScaling)
  }

  if (settings.disableMouse) {
    args.push('--disable-mouse')
  }

  if (settings.disableParallax) {
    args.push('--disable-parallax')
  }

  // Paths
  if (settings.assetsDir) {
    args.push('--assets-dir', settings.assetsDir)
  }

  return args
}
