import { useEffect, useRef, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { Fragment } from "@/generated/prisma";

import { MessageCard } from "./message-card";
import { MessageForm } from "./message-form";
import { MessageLoading } from "./message-loading";

interface Props {
    projectId: string;
    activeFragment: Fragment | null;
    setActiveFragment: (fragment: Fragment | null) => void;
    hideForm?: boolean;
};

export const MessagesContainer = ({
    projectId,
    activeFragment,
    setActiveFragment,
    hideForm = false
}: Props) => {
    const trpc = useTRPC();
    const bottomRef = useRef<HTMLDivElement>(null);
    const lastAssistantMessageIdRef = useRef<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const { data: messages } = useSuspenseQuery(trpc.messages.getMany.queryOptions({
        projectId: projectId,
    }, {
        // Poll faster when processing (1s) vs idle (2s)
        refetchInterval: isProcessing ? 1000 : 2000,
    }));

    // Find thinking message to display its content
    const thinkingMessage = messages.find((message) => message.type === "THINKING");

    // Filter out THINKING messages from the main display
    const displayMessages = messages.filter((message) => message.type !== "THINKING");

    // Show loading if there's a thinking message or if last message is from user
    const lastMessage = displayMessages[displayMessages.length - 1];
    const currentlyProcessing = !!thinkingMessage || lastMessage?.role === "USER";

    // Update processing state to affect refetch interval
    useEffect(() => {
        setIsProcessing(currentlyProcessing);
    }, [currentlyProcessing]);

    // Auto-select fragment when new assistant messages arrive
    useEffect(() => {
        const lastAssistantMessage = displayMessages.findLast(
            (message) => message.role === "ASSISTANT" && message.type !== "THINKING"
        );

        if (
            lastAssistantMessage?.fragment &&
            lastAssistantMessage.id !== lastAssistantMessageIdRef.current
        ) {
            setActiveFragment(lastAssistantMessage.fragment);
            lastAssistantMessageIdRef.current = lastAssistantMessage.id;
        }
    }, [displayMessages, setActiveFragment]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        bottomRef.current?.scrollIntoView();
    }, [messages.length]);

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="pt-2 pr-1">
                    {displayMessages.map((message) => (
                        <MessageCard
                            key={message.id}
                            content={message.content}
                            role={message.role}
                            fragment={message.fragment}
                            createdAt={message.createdAt}
                            isActiveFragment={activeFragment?.id === message.fragment?.id}
                            onFragmentClick={() => setActiveFragment(message.fragment)}
                            type={message.type}
                        />
                    ))}
                    {isProcessing && (
                        <MessageLoading
                            thinkingContent={thinkingMessage?.content}
                            startTime={thinkingMessage?.createdAt}
                        />
                    )}
                    <div ref={bottomRef} />
                </div>
            </div>
            {!hideForm && (
                <div className="relative p-3 pt-1">
                    <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background pointer-events-none" />
                    <MessageForm projectId={projectId} />
                </div>
            )}
        </div>
    );
};