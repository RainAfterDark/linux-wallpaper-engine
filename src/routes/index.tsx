import { createFileRoute } from '@tanstack/react-router'
import { ThemeToggle } from '@/components/theme-toggle'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-bold">Linux Wallpaper Engine</h1>
        <p className="mt-4 text-muted-foreground">
          Your Electron app is ready
        </p>
      </div>
    </div>
  )
}
