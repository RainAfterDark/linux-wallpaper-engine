import { X, ChevronLeft, ChevronRight, Check } from "lucide-react"
import type { CardComponentProps } from "onborda-rrd"
import { useOnborda } from "onborda-rrd"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { trpc } from "@/lib/trpc"

export function OnboardingCard({
    step,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    arrow,
}: CardComponentProps) {
    const { closeOnborda } = useOnborda()
    const utils = trpc.useUtils()
    const updateSettings = trpc.settings.update.useMutation({
        onSuccess: () => utils.settings.get.invalidate(),
    })

    const isLastStep = currentStep === totalSteps - 1
    const isFirstStep = currentStep === 0

    const handleFinish = () => {
        updateSettings.mutate({
            onboardingComplete: true,
            dismissedScanReminder: true,
        })
        closeOnborda()
    }

    const handleSkip = () => {
        updateSettings.mutate({ onboardingComplete: true })
        closeOnborda()
    }

    return (
        <div
            className={cn(
                "relative w-[340px] rounded-xl border bg-card/95 p-5 shadow-2xl backdrop-blur-xl",
                isLastStep
                    ? "border-warning/60 ring-2 ring-warning/20"
                    : "border-border"
            )}
        >
            {arrow}

            {/* Close button */}
            <button
                onClick={handleSkip}
                className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Skip tour"
            >
                <X className="size-4" />
            </button>

            {/* Icon + Title */}
            <div className="mb-3 flex items-center gap-2.5">
                <div
                    className={cn(
                        "flex size-8 items-center justify-center rounded-lg",
                        isLastStep ? "bg-warning/20" : "bg-primary/10"
                    )}
                >
                    {step.icon}
                </div>
                <h3
                    className={cn(
                        "text-sm font-semibold",
                        isLastStep && "text-warning"
                    )}
                >
                    {step.title}
                </h3>
            </div>

            {/* Content */}
            <div className="mb-4 text-sm leading-relaxed text-muted-foreground">
                {step.content}
            </div>

            {/* Progress dots */}
            <div className="mb-4 flex items-center justify-center gap-1.5">
                {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            i === currentStep
                                ? "w-6 bg-primary"
                                : i < currentStep
                                    ? "w-1.5 bg-primary/40"
                                    : "w-1.5 bg-muted-foreground/20"
                        )}
                    />
                ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="text-xs text-muted-foreground hover:text-foreground"
                >
                    Skip Tour
                </Button>

                <div className="flex items-center gap-2">
                    {!isFirstStep && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={prevStep}
                            className="gap-1"
                        >
                            <ChevronLeft className="size-3.5" />
                            Back
                        </Button>
                    )}

                    {isLastStep ? (
                        <Button
                            size="sm"
                            onClick={handleFinish}
                            className="gap-1.5 bg-warning text-warning-foreground hover:bg-warning/90"
                        >
                            <Check className="size-3.5" />
                            Finish
                        </Button>
                    ) : (
                        <Button size="sm" onClick={nextStep} className="gap-1">
                            Next
                            <ChevronRight className="size-3.5" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
