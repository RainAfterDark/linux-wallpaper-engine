import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Linux Wallpaper Engine</h1>
        <p className="mt-4 text-muted-foreground">
          Your Electron app is ready
        </p>
      </div>
    </div>
  )
}
