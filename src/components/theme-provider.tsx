import { createContext, useContext, useEffect, useState } from 'react'

type ThemeMode = 'dark' | 'light' | 'system'
type ThemeStyle = 'default' | 'steam'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultMode?: ThemeMode
  defaultStyle?: ThemeStyle
  storageKey?: string
}

type ThemeProviderState = {
  mode: ThemeMode
  style: ThemeStyle
  setMode: (mode: ThemeMode) => void
  setStyle: (style: ThemeStyle) => void
}

const initialState: ThemeProviderState = {
  mode: 'system',
  style: 'default',
  setMode: () => null,
  setStyle: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultMode = 'system',
  defaultStyle = 'default',
  storageKey = 'wallpaper-engine-theme',
  ...props
}: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(
    () => (localStorage.getItem(`${storageKey}-mode`) as ThemeMode) ?? defaultMode
  )
  const [style, setStyle] = useState<ThemeStyle>(
    () => (localStorage.getItem(`${storageKey}-style`) as ThemeStyle) ?? defaultStyle
  )

  useEffect(() => {
    const root = window.document.documentElement

    // Remove all theme classes
    root.classList.remove('light', 'dark', 'steam')

    // Handle steam style (it's always "dark" mode)
    if (style === 'steam') {
      root.classList.add('steam')
      return
    }

    // Handle default style with light/dark/system modes
    if (mode === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
      return
    }

    root.classList.add(mode)
  }, [mode, style])

  const value = {
    mode,
    style,
    setMode: (newMode: ThemeMode) => {
      localStorage.setItem(`${storageKey}-mode`, newMode)
      setMode(newMode)
    },
    setStyle: (newStyle: ThemeStyle) => {
      localStorage.setItem(`${storageKey}-style`, newStyle)
      setStyle(newStyle)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
