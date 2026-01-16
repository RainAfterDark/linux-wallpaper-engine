import { Moon, Sun, Monitor, Gamepad2 } from "lucide-react"

import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle() {
  const { mode, style, setMode, setStyle } = useTheme()

  const handleModeChange = (newMode: 'light' | 'dark' | 'system') => {
    setMode(newMode)
    if (style === 'steam') {
      setStyle('default')
    }
  }

  const handleSteamTheme = () => {
    setStyle('steam')
  }

  const isSteam = style === 'steam'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          {isSteam ? (
            <Gamepad2 className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <>
              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            </>
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Theme Mode</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => handleModeChange("light")}
          className={!isSteam && mode === 'light' ? 'bg-accent' : ''}
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleModeChange("dark")}
          className={!isSteam && mode === 'dark' ? 'bg-accent' : ''}
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleModeChange("system")}
          className={!isSteam && mode === 'system' ? 'bg-accent' : ''}
        >
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Theme Style</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={handleSteamTheme}
          className={isSteam ? 'bg-accent' : ''}
        >
          <Gamepad2 className="mr-2 h-4 w-4" />
          Steam
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}