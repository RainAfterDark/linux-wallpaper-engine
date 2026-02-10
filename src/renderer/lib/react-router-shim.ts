/**
 * Shim for react-router-dom used by onborda-rrd.
 * Re-exports TanStack Router's useNavigate with a compatible API.
 * onborda-rrd calls navigate(route) which maps to TanStack's navigate({ to: route }).
 */
import { useNavigate as useTanStackNavigate } from "@tanstack/react-router"

export function useNavigate() {
    const navigate = useTanStackNavigate()
    return (to: string) => navigate({ to })
}
