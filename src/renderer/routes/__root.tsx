import { Outlet, createRootRoute } from '@tanstack/react-router'
import { ThemeProvider } from '@/components/theme-provider'
import { AppShell } from '@/components/layout/AppShell'

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider defaultMode="dark" defaultStyle="steam" storageKey="wallpaper-engine-theme">
      <AppShell>
        <Outlet />
      </AppShell>
    </ThemeProvider>
  ),
})
