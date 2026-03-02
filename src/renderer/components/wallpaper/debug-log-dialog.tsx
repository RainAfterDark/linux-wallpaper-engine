import { useEffect, useRef } from "react"
import { Copy, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { trpc } from "@/lib/trpc"

interface DebugLogDialogProps {
    open: boolean
    onClose: () => void
    screen: string
}

export function DebugLogDialog({ open, onClose, screen }: DebugLogDialogProps) {
    const logEndRef = useRef<HTMLDivElement>(null)

    const { data } = trpc.wallpaper.getDebugLogs.useQuery(
        { screen },
        {
            enabled: open && !!screen,
            refetchInterval: open ? 500 : false,
        },
    )

    const clearMutation = trpc.wallpaper.clearDebugLogs.useMutation()

    const logs = data?.logs ?? []
    const command = data?.command ?? ''

    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [logs.length])

    const handleClose = () => {
        clearMutation.mutate({ screen })
        onClose()
    }

    const handleCopyLogs = () => {
        const text = [
            `$ ${command}`,
            '',
            ...logs,
        ].join('\n')
        navigator.clipboard.writeText(text)
    }

    const handleCopyCommand = () => {
        navigator.clipboard.writeText(command)
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
            <DialogContent className="w-[90vw] max-w-4xl max-h-[80vh] flex flex-col scrollbar-styled">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Terminal className="size-5" />
                        Debug Logs — {screen}
                    </DialogTitle>
                    <DialogDescription>
                        Real-time process output from linux-wallpaperengine
                    </DialogDescription>
                </DialogHeader>

                {command && (
                    <div className="flex items-center gap-2 rounded-md bg-muted/50 border border-border px-3 py-2">
                        <pre className="flex-1 text-xs text-muted-foreground whitespace-pre-wrap break-all font-mono">
                            $ {command}
                        </pre>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={handleCopyCommand}
                            title="Copy command"
                            className="shrink-0 text-muted-foreground hover:text-foreground"
                        >
                            <Copy className="size-3.5" />
                        </Button>
                    </div>
                )}

                <div className="flex-1 min-h-0 overflow-y-auto rounded-md bg-muted/50 border border-border p-3 font-mono text-xs text-foreground whitespace-pre-wrap break-all scrollbar-thin">
                    {logs.length === 0 ? (
                        <p className="text-muted-foreground italic">Waiting for output...</p>
                    ) : (
                        logs.map((line, i) => (
                            <div
                                key={i}
                                className={
                                    line.startsWith('[stderr]')
                                        ? 'text-warning'
                                        : line.startsWith('[process]')
                                            ? 'text-destructive'
                                            : ''
                                }
                            >
                                {line}
                            </div>
                        ))
                    )}
                    <div ref={logEndRef} />
                </div>

                <DialogFooter>
                    <Button variant="outline" size="sm" onClick={handleCopyLogs}>
                        <Copy className="size-4 mr-2" />
                        Copy Logs
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
