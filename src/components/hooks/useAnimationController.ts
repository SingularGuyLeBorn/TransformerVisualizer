// FILE: src/components/hooks/useAnimationController.ts
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * A generic hook for controlling step-by-step animations.
 * @param totalSteps Total number of steps in the animation sequence.
 * @param delay Delay in milliseconds between steps during playback.
 * @returns An object with state and control functions.
 */
export const useAnimationController = (totalSteps: number, delay: number = 500) => {
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const intervalRef = useRef<number | null>(null);

    const stopInterval = useCallback(() => {
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (isPlaying) {
            if (currentStep >= totalSteps - 1) {
                setIsPlaying(false);
                stopInterval();
                return;
            }
            intervalRef.current = window.setInterval(() => {
                setCurrentStep(prev => {
                    if (prev >= totalSteps - 1) {
                        stopInterval();
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, delay);
        } else {
            stopInterval();
        }
        return () => stopInterval();
    }, [isPlaying, currentStep, totalSteps, delay, stopInterval]);

    const play = useCallback(() => {
        if (currentStep >= totalSteps - 1) {
            setCurrentStep(0);
        }
        setIsPlaying(true);
    }, [currentStep, totalSteps]);

    const pause = useCallback(() => setIsPlaying(false), []);

    const reset = useCallback(() => {
        setIsPlaying(false);
        setCurrentStep(0);
    }, []);

    const setStepManually = useCallback((newStep: number) => {
        setIsPlaying(false);
        if (newStep >= 0 && newStep < totalSteps) {
            setCurrentStep(newStep);
        }
    }, [totalSteps]);

    return {
        currentStep,
        isPlaying,
        play,
        pause,
        reset,
        setStepManually
    };
};
// END OF FILE: src/components/hooks/useAnimationController.ts