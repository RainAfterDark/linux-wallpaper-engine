import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RefreshButtonProps {
    onClick: () => void
    isLoading?: boolean
}

export function RefreshButton({ onClick, isLoading = false }: RefreshButtonProps) {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={onClick}
            disabled={isLoading}
        >
            <RefreshCw className={`size-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
        </Button>
    )
}
