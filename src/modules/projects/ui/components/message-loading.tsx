"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDownIcon, ChevronRightIcon, Loader2Icon } from "lucide-react";

interface Props {
    thinkingContent?: string;
    startTime?: Date;
}

export const MessageLoading = ({ thinkingContent, startTime }: Props) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // Update elapsed time every second
    useEffect(() => {
        const start = startTime ? new Date(startTime).getTime() : Date.now();

        const updateElapsed = () => {
            const now = Date.now();
            setElapsedSeconds(Math.floor((now - start) / 1000));
        };

        updateElapsed();
        const interval = setInterval(updateElapsed, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    const formatTime = (seconds: number) => {
        if (seconds < 60) {
            return `${seconds} second${seconds !== 1 ? 's' : ''}`;
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    return (
        <div className="flex flex-col group px-2 pb-4">
            <div className="flex items-center gap-2 pl-2 mb-2">
                <Image
                    src="/logo.svg"
                    alt="Navs"
                    width={18}
                    height={18}
                    className="shrink-0"
                />
                <span className="text-sm font-medium">navs</span>
            </div>
            <div className="pl-8.5 flex flex-col gap-y-2">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                    {isExpanded ? (
                        <ChevronDownIcon className="size-4" />
                    ) : (
                        <ChevronRightIcon className="size-4" />
                    )}
                    <span>Thinking for {formatTime(elapsedSeconds)}</span>
                    <Loader2Icon className="size-3 animate-spin ml-1" />
                </button>

                {isExpanded && thinkingContent && (
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap pl-5 border-l-2 border-muted ml-2 py-2">
                        {thinkingContent}
                    </div>
                )}
            </div>
        </div>
    );
};