import { RefreshButton } from "./refresh-button"

interface GridHeaderProps {
    onRefresh: () => void
    isLoading: boolean
}

export function GridHeader({ onRefresh, isLoading }: GridHeaderProps) {
    return (
        <div className="mb-6 flex flex-row items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold">Installed</h1>
                <p className="text-muted-foreground">
                    Wallpapers downloaded to your system
                </p>
            </div>
            <RefreshButton onClick={onRefresh} isLoading={isLoading} />
        </div>
    )
}
