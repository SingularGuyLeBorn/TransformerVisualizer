// FILE: src/components/visualizers/utils.ts

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 格式化数字以便显示
 * @param num 要格式化的数字
 * @param precision 小数位数，默认为3
 * @returns 格式化后的字符串
 */
export const formatNumber = (num: number, precision: number = 3): string => {
    if (num === -Infinity) return '-∞';
    if (num === Infinity) return '∞';
    const fixed = num.toFixed(precision);
    // 移除末尾多余的0和可能存在的小数点
    return parseFloat(fixed).toString();
};


/**
 * 一个用于控制分步动画的 React Hook
 * @param totalSteps 动画总步数
 * @param delay 动画每一步之间的延迟（毫秒）
 * @returns [currentStep, play, pause, reset]
 */
export const useAnimationController = (totalSteps: number, delay: number = 500) => {
    const [step, setStep] = useState<number>(-1); // -1表示未开始
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
            if (step >= totalSteps - 1) {
                setIsPlaying(false);
                stopInterval();
                return;
            }
            intervalRef.current = window.setInterval(() => {
                setStep(prev => {
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
    }, [isPlaying, step, totalSteps, delay, stopInterval]);

    const play = useCallback(() => {
        if (step >= totalSteps - 1) {
            setStep(0);
        } else if (step === -1) {
            setStep(0);
        }
        setIsPlaying(true);
    }, [step, totalSteps]);

    const pause = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const reset = useCallback(() => {
        setIsPlaying(false);
        setStep(-1);
    }, []);

    const setStepManually = useCallback((newStep: number) => {
        setIsPlaying(false); // Stop playback when user interacts with slider
        if (newStep >= -1 && newStep < totalSteps) {
            setStep(newStep);
        }
    }, [totalSteps]);


    return {
        currentStep: step,
        isPlaying,
        play,
        pause,
        reset,
        setStepManually
    };
};

/**
 * 计算两个 DOM 元素中心点之间的 SVG 曲线路径
 * @param startEl 起始 DOM 元素
 * @param endEl 结束 DOM 元素
 * @param containerEl 容器 DOM 元素，用于计算相对坐标
 * @returns SVG 'd' 属性字符串
 */
export const getCurvePath = (startEl: Element | null, endEl: Element | null, containerEl: Element | null): string => {
    if (!startEl || !endEl || !containerEl) return '';

    const containerRect = containerEl.getBoundingClientRect();
    const startRect = startEl.getBoundingClientRect();
    const endRect = endEl.getBoundingClientRect();

    const startX = startRect.left + startRect.width / 2 - containerRect.left;
    const startY = startRect.top + startRect.height / 2 - containerRect.top;
    const endX = endRect.left + endRect.width / 2 - containerRect.left;
    const endY = endRect.top + endRect.height / 2 - containerRect.top;

    const dx = endX - startX;
    const dy = endY - startY;

    // 控制点，用于创建曲线效果
    const cp1x = startX + dx * 0.25;
    const cp1y = startY + dy * 0.1;
    const cp2x = startX + dx * 0.75;
    const cp2y = startY + dy * 0.9;

    return `M ${startX} ${startY} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${endX},${endY}`;
};


// END OF FILE: src/components/visualizers/utils.ts