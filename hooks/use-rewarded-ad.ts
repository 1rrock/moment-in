import { useCallback, useRef, useState, useEffect } from "react";
import { GoogleAdMob } from "@apps-in-toss/web-framework";


const TEST_AD_GROUP_ID = "ait.v2.live.b03c486e67824a95";

interface RewardedAdCallbacks {
    onRewarded?: () => void;
    onDismiss?: () => void;
}

export function useRewardedAd() {
    const [loading, setLoading] = useState(true);
    const cleanupRef = useRef<(() => void) | undefined>(undefined);
    const rewardCallbackRef = useRef<(() => void) | undefined>(undefined);
    const dismissCallbackRef = useRef<(() => void) | undefined>(undefined);

    const loadRewardAd = useCallback(() => {
        setLoading(true);

        const isAdUnsupported =
            GoogleAdMob.loadAppsInTossAdMob.isSupported?.() === false;

        if (isAdUnsupported) {
            return;
        }

        cleanupRef.current?.();
        cleanupRef.current = undefined;

        const cleanup = GoogleAdMob.loadAppsInTossAdMob({
            options: {
                adGroupId: TEST_AD_GROUP_ID,
            },
            onEvent: (event) => {
                if (event.type === "loaded") {
                    setLoading(false);
                }
            },
            onError: (error) => {
            },
        });

        cleanupRef.current = cleanup;
    }, []);

    useEffect(() => {
        loadRewardAd();
        return () => {
            cleanupRef.current?.();
        };
    }, [loadRewardAd]);

    const showRewardAd = ({ onRewarded, onDismiss }: RewardedAdCallbacks) => {
        const isAdUnsupported =
            GoogleAdMob.showAppsInTossAdMob.isSupported?.() === false;

        if (loading || isAdUnsupported) {
            // 광고가 안될 경우 바로 보상을 주거나 에러 처리를 해야 할 수도 있지만, 
            // 요구사항에 맞춰 시도합니다.
            return;
        }

        rewardCallbackRef.current = onRewarded;
        dismissCallbackRef.current = onDismiss;

        GoogleAdMob.showAppsInTossAdMob({
            options: {
                adGroupId: TEST_AD_GROUP_ID,
            },
            onEvent: (event) => {
                switch (event.type) {
                    case "requested":
                        break;

                    case "dismissed":
                        dismissCallbackRef.current?.();
                        dismissCallbackRef.current = undefined;
                        break;

                    case "failedToShow":
                        break;

                    case "impression":
                        break;

                    case "show":
                        break;

                    case "userEarnedReward":
                        rewardCallbackRef.current?.();
                        rewardCallbackRef.current = undefined;
                        break;
                }
            },
            onError: (error) => {
            },
        });
    };

    return {
        loading,
        loadRewardAd,
        showRewardAd,
    };
}
