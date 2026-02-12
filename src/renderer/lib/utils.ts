import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { BASE_FPS_OPTIONS } from "../../shared/constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// Format bytes to human-readable file size
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

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
