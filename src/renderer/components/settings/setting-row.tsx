import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SettingRowProps {
    label: string
    children: React.ReactNode
    changed?: boolean
    onClear?: () => void
}

export function SettingRow({ label, children, changed, onClear }: SettingRowProps) {
    return (
        <div
            className={cn(
                "flex items-center justify-between px-4 py-3 transition-colors rounded-md",
                changed && "bg-primary/10 ring-1 ring-primary/30"
            )}
        >
            <span className="text-sm">{label}</span>
            <div className="flex items-center gap-2">
                {children}
                {changed && onClear && (
                    <button
                        onClick={onClear}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="Reset to global default"
                    >
                        <X className="size-3.5" />
                    </button>
                )}
            </div>
        </div>
    )
}
