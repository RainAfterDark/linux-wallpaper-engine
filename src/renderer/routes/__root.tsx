import { Outlet, createRootRoute } from '@tanstack/react-router'
import { ThemeProvider } from '@/components/theme-provider'
import { AppShell } from '@/components/layout/app-shell'
import { SearchProvider } from '@/contexts/search-context'
import { WallpaperBackgroundProvider } from '@/contexts/wallpaper-background-context'

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider defaultMode="dark" storageKey="wallpaper-engine-theme">
      <SearchProvider>
        <WallpaperBackgroundProvider>
          <AppShell>
            <Outlet />
          </AppShell>
        </WallpaperBackgroundProvider>
      </SearchProvider>
    </ThemeProvider>
  ),
})
