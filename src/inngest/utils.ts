import { Sandbox } from "@e2b/code-interpreter";
import { AgentResult, Message, TextMessage } from "@inngest/agent-kit";

import { SANDBOX_TIMEOUT } from "./types";

export async function getSandbox(sandboxId: string) {
    const sandbox = await Sandbox.connect(sandboxId);
    await sandbox.setTimeout(SANDBOX_TIMEOUT);
    return sandbox;
};

export function lastAssistantTextMessageContent(result: AgentResult) {
    const lastAssistantTextMessageIndex = result.output.findLastIndex(
        (message) => message.role === "assistant",
    );

    const message = result.output[lastAssistantTextMessageIndex] as
        | TextMessage
        | undefined;

    return message?.content
        ? typeof message.content === "string"
            ? message.content
            : message.content.map((c) => c.text).join("")
        : undefined;
};

export const parseAgentOutput = (value: Message[]) => {
    const output = value[0];

    if (output.type !== "text") {
        return "Fragment";
    }

    if (Array.isArray(output.content)) {
        return output.content.map((txt) => txt).join("")
    } else {
        return output.content
    }
};

/**
 * Extracts a user-friendly "thinking" summary from the model's raw output.
 * Looks for task analysis content or truncates long responses to show current progress.
 */
export const extractThinkingContent = (content: string): string | null => {
    // If the content contains task_summary, extract just the thinking portion
    if (content.includes("<task_summary>")) {
        // Extract content before task_summary as thats the thinking part
        const thinkingPart = content.split("<task_summary>")[0].trim();
        if (thinkingPart) {
            return formatThinkingContent(thinkingPart);
        }
    }

    // Look for task analysis section
    const taskAnalysisMatch = content.match(/<task_analysis>([\s\S]*?)<\/task_analysis>/);
    if (taskAnalysisMatch) {
        return formatThinkingContent(taskAnalysisMatch[1]);
    }

    // If no special sections, return a truncated version of the content
    return formatThinkingContent(content);
};

/**
 * Formats thinking content to be user-friendly and not too long
 */
const formatThinkingContent = (content: string): string => {
    // Remove XML tags
    let cleaned = content.replace(/<[^>]*>/g, " ").trim();

    // Split into lines and filter out empty ones
    const lines = cleaned.split("\n").map(l => l.trim()).filter(l => l.length > 0);

    // Take first few meaningful lines
    const meaningfulLines = lines.slice(0, 5);

    // Join and truncate if needed
    let result = meaningfulLines.join("\n");

    if (result.length > 500) {
        result = result.substring(0, 500) + "...";
    }

    return result || "Processing...";
};