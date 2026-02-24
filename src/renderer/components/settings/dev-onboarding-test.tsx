import { Play } from "lucide-react"
import { useOnborda } from "onborda-rrd"
import { ONBOARDING_TOUR_ID } from "@/components/onboarding/onboarding-steps"
import { SettingsSection } from "@/components/settings/settings-section"
import { SettingRow } from "@/components/settings/setting-row"
import { LoadingButton } from "@/components/loading-button"
import { trpc } from "@/lib/trpc"

export function DevOnboardingTest() {
    const { startOnborda } = useOnborda()
    const utils = trpc.useUtils()
    const updateMutation = trpc.settings.update.useMutation({
        onSuccess: () => utils.settings.get.invalidate(),
    })

    return (
        <SettingsSection
            icon={Play}
            title="Developer"
            description="Testing utilities (dev only)"
            className="max-2xl:mb-4"
        >
            <SettingRow label="Test onboarding tour">
                <LoadingButton
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        updateMutation.mutate({ onboardingComplete: false })
                        setTimeout(() => startOnborda(ONBOARDING_TOUR_ID), 100)
                    }}
                    isLoading={false}
                >
                    <Play className="size-4 mr-2" />
                    Start Tour
                </LoadingButton>
            </SettingRow>
        </SettingsSection>
    )
}
