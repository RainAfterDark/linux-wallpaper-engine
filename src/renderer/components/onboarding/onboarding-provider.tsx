import { useEffect, useRef } from "react"
import { Onborda, OnbordaProvider, useOnborda } from "onborda-rrd"
import { useNavigate, useRouterState } from "@tanstack/react-router"
import { trpc } from "@/lib/trpc"
import { onboardingSteps, ONBOARDING_TOUR_ID } from "@/components/onboarding/onboarding-steps"
import { OnboardingCard } from "./onboarding-card"

interface OnboardingWrapperProps {
    children: React.ReactNode
}

function OnboardingTourStarter({ children }: { children: React.ReactNode }) {
    const { data: settings, isLoading } = trpc.settings.get.useQuery()
    const { startOnborda, isOnbordaVisible } = useOnborda()
    const navigate = useNavigate()
    const pathname = useRouterState().location.pathname
    const hasStarted = useRef(false)

    const shouldStart = !isLoading && settings && !settings.onboardingComplete && !hasStarted.current

    const maximizeWindow = trpc.window.maximize.useMutation()

    useEffect(() => {
        if (!shouldStart) return

        // Navigate to the installed page first so step 0's target element exists
        if (pathname !== "/") {
            navigate({ to: "/" })
            return
        }

        // Maximize the window so all onboarding targets are visible
        maximizeWindow.mutate()

        const timer = setTimeout(() => {
            hasStarted.current = true
            startOnborda(ONBOARDING_TOUR_ID)
        }, 800)
        return () => clearTimeout(timer)
    }, [shouldStart, pathname])

    // Reset when user clicks "Restart Tour" (onboardingComplete transitions true → false)
    const prevOnboardingComplete = useRef(settings?.onboardingComplete)
    useEffect(() => {
        if (prevOnboardingComplete.current === true && settings?.onboardingComplete === false) {
            hasStarted.current = false
        }
        prevOnboardingComplete.current = settings?.onboardingComplete
    }, [settings?.onboardingComplete])

    return (
        <Onborda
            steps={onboardingSteps}
            showOnborda={isOnbordaVisible}
            shadowRgb="0,0,0"
            shadowOpacity="0.7"
            cardComponent={OnboardingCard}
            cardTransition={{ duration: 0.3, type: "tween" }}
        >
            {children}
        </Onborda>
    )
}

export function OnboardingWrapper({ children }: OnboardingWrapperProps) {
    return (
        <OnbordaProvider>
            <OnboardingTourStarter>{children}</OnboardingTourStarter>
        </OnbordaProvider>
    )
}
