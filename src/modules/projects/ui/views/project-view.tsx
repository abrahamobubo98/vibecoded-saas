"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Suspense, useState } from "react";
import { EyeIcon, CodeIcon, CrownIcon, MessageSquareIcon } from "lucide-react";

import { Fragment } from "@/generated/prisma";
import { Button } from "@/components/ui/button";
import { UserControl } from "@/components/user-control";
import { FileExplorer } from "@/components/file-explorer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";

import { FragmentWeb } from "../components/fragment-web";
import { ProjectHeader } from "../components/project-header";
import { MessageForm } from "../components/message-form";
import { MessagesContainer } from "../components/messages-container";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
    projectId: string;
};

export const ProjectView = ({ projectId }: Props) => {
    const { has } = useAuth();
    const hasProAccess = has?.({ plan: "pro" });
    const isMobile = useIsMobile();

    const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
    const [tabState, setTabState] = useState<"preview" | "code">("preview");
    const [mobileView, setMobileView] = useState<"chat" | "demo">("chat");

    // Mobile Layout
    if (isMobile) {
        return (
            <div className="h-screen flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-2 border-b">
                    <ErrorBoundary fallback={<p>Project header error</p>}>
                        <Suspense fallback={<p>Loading...</p>}>
                            <ProjectHeader projectId={projectId} />
                        </Suspense>
                    </ErrorBoundary>
                    <div className="flex items-center gap-x-2">
                        {!hasProAccess && (
                            <Button asChild size="sm" variant="tertiary">
                                <Link href="/pricing">
                                    <CrownIcon className="size-4" /> Upgrade
                                </Link>
                            </Button>
                        )}
                        <UserControl />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                    {mobileView === "chat" ? (
                        <ErrorBoundary fallback={<p>Messages container error</p>}>
                            <Suspense fallback={<p>Loading messages...</p>}>
                                <MessagesContainer
                                    projectId={projectId}
                                    activeFragment={activeFragment}
                                    setActiveFragment={setActiveFragment}
                                    hideForm={true}
                                />
                            </Suspense>
                        </ErrorBoundary>
                    ) : (
                        <div className="h-full flex flex-col">
                            {tabState === "preview" ? (
                                <>
                                    {!!activeFragment && <FragmentWeb data={activeFragment} />}
                                    {!activeFragment && (
                                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                            No preview available
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    {!!activeFragment?.files ? (
                                        <FileExplorer
                                            files={activeFragment.files as { [path: string]: string }}
                                        />
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                            No code available
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Tab Bar Above Input */}
                <div className="border-t bg-background p-3">
                    <div className="flex items-center gap-2 mb-3">
                        {/* Segmented Control Container */}
                        <div className="flex-1 flex border border-border rounded-lg overflow-hidden">
                            <button
                                onClick={() => setMobileView("chat")}
                                className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${mobileView === "chat"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
                            >
                                Chat
                            </button>
                            <button
                                onClick={() => {
                                    setMobileView("demo");
                                    setTabState("preview");
                                }}
                                className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${mobileView === "demo"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
                            >
                                Demo
                            </button>
                        </div>
                        {/* Code Toggle Button */}
                        <button
                            onClick={() => {
                                setMobileView("demo");
                                setTabState(tabState === "code" ? "preview" : "code");
                            }}
                            className={`size-10 rounded-lg border flex items-center justify-center text-xs font-mono transition-colors ${mobileView === "demo" && tabState === "code"
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                                }`}
                            title="View Code"
                        >
                            {"</>"}
                        </button>
                    </div>
                    <MessageForm projectId={projectId} />
                </div>
            </div>
        );
    }

    // Desktop Layout
    return (
        <div className="h-screen">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel
                    defaultSize={35}
                    minSize={20}
                    className="flex flex-col min-h-0"
                >
                    <ErrorBoundary fallback={<p>Project header error</p>}>
                        <Suspense fallback={<p>Loading project...</p>}>
                            <ProjectHeader projectId={projectId} />
                        </Suspense>
                    </ErrorBoundary>
                    <ErrorBoundary fallback={<p>Messages container error</p>}>
                        <Suspense fallback={<p>Loading messages...</p>}>
                            <MessagesContainer
                                projectId={projectId}
                                activeFragment={activeFragment}
                                setActiveFragment={setActiveFragment}
                            />
                        </Suspense>
                    </ErrorBoundary>
                </ResizablePanel>
                <ResizableHandle className="hover:bg-primary transition-colors" />
                <ResizablePanel
                    defaultSize={65}
                    minSize={50}
                >
                    <Tabs
                        className="h-full gap-y-0"
                        defaultValue="preview"
                        value={tabState}
                        onValueChange={(value) => setTabState(value as "preview" | "code")}
                    >
                        <div className="w-full flex items-center p-2 border-b gap-x-2">
                            <TabsList className="h-8 p-0 border rounded-md">
                                <TabsTrigger value="preview" className="rounded-md">
                                    <EyeIcon /> <span>Demo</span>
                                </TabsTrigger>
                                <TabsTrigger value="code" className="rounded-md">
                                    <CodeIcon /> <span>Code</span>
                                </TabsTrigger>
                            </TabsList>
                            <div className="ml-auto flex items-center gap-x-2">
                                {!hasProAccess && (
                                    <Button asChild size="sm" variant="tertiary">
                                        <Link href="/pricing">
                                            <CrownIcon /> Upgrade
                                        </Link>
                                    </Button>
                                )}
                                <UserControl />
                            </div>
                        </div>
                        <TabsContent value="preview">
                            {!!activeFragment && <FragmentWeb data={activeFragment} />}
                        </TabsContent>
                        <TabsContent value="code" className="min-h-0">
                            {!!activeFragment?.files && (
                                <FileExplorer
                                    files={activeFragment.files as { [path: string]: string }}
                                />
                            )}
                        </TabsContent>
                    </Tabs>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
};