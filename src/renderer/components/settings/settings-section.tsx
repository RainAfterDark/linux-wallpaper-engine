import * as React from "react"

interface SettingsSectionProps {
    id?: string
    icon: React.ElementType
    title: string
    description: string
    children: React.ReactNode
}

export function SettingsSection({ id, icon: Icon, title, description, children }: SettingsSectionProps) {
    return (
        <div id={id} className="rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border p-4">
                <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                    <Icon className="size-4 text-muted-foreground" />
                </div>
                <div>
                    <h2 className="font-semibold">{title}</h2>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
            <div className="divide-y divide-border">{children}</div>
        </div>
    )
}
