import { RefreshCw } from "lucide-react"
import { LoadingButton } from "@/components/loading-button"

interface RefreshButtonProps {
    onClick: () => void
    isLoading?: boolean
}

export function RefreshButton({ onClick, isLoading = false }: RefreshButtonProps) {
    return (
        <LoadingButton
            variant="ghost"
            size="sm"
            onClick={onClick}
            isLoading={isLoading}
            loadingText="Refreshing..."
            className="ring-1 ring-foreground/20 hover:ring-foreground/40"
        >
            <RefreshCw className="size-4 mr-2" />
            Refresh
        </LoadingButton>
    )
}
