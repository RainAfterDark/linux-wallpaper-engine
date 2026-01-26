import * as React from "react"

interface SettingRowProps {
    label: string
    children: React.ReactNode
}

export function SettingRow({ label, children }: SettingRowProps) {
    return (
        <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm">{label}</span>
            <div className="flex items-center gap-2">{children}</div>
        </div>
    )
}
