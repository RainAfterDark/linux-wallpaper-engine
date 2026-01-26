import { Outlet, createRootRoute } from '@tanstack/react-router'
import { ThemeProvider } from '@/components/theme-provider'
import { AppShell } from '@/components/layout/AppShell'
import { SearchProvider } from '@/contexts/SearchContext'

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider defaultMode="dark" defaultStyle="steam" storageKey="wallpaper-engine-theme">
      <SearchProvider>
        <AppShell>
          <Outlet />
        </AppShell>
      </SearchProvider>
    </ThemeProvider>
  ),
})
