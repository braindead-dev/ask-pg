"use client";

import { cn } from "@/lib/utils";

import { useChat } from "ai/react";

import { ArrowUpIcon, Share, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AutoResizeTextarea } from "@/components/autoresize-textarea";
import { Attribution } from "@/components/attribution";
import { MarkdownContent } from "@/components/markdown-content";
import { CitationLink } from "@/components/citation-link";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";

interface ChatFormProps extends React.ComponentProps<"form"> {
  initialMessages?: any[];
  isShared?: boolean;
}

export function ChatForm({
  className,
  initialMessages,
  isShared,
  ...props
}: ChatFormProps) {
  const { messages, input, setInput, append, error } = useChat({
    api: "/api/chat",
    initialMessages,
  });

  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState("Copy");

  const handleShare = async () => {
    if (messages.length === 0) return;
    setShowShareDialog(true);
  };

  const handleCreateLink = async () => {
    if (messages.length === 0) return;
    setIsGeneratingLink(true);

    try {
      // Clean messages to only include essential fields
      const cleanMessages = messages.map(({ role, content }) => ({
        role,
        content,
      }));

      const response = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: cleanMessages }),
      });

      if (!response.ok) {
        throw new Error("Failed to share chat");
      }

      const { url } = await response.json();
      const fullShareUrl = `${window.location.origin}${url}`;
      setShareUrl(fullShareUrl);
      await navigator.clipboard.writeText(fullShareUrl);
    } catch (error) {
      console.error("Failed to generate share link:", error);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopyButtonText("Copied");
      setTimeout(() => {
        setCopyButtonText("Copy");
      }, 1000);
    }
  };

  const topHeader = (
    <div className="relative flex justify-center items-center p-4">
      <Link
        href="/"
        onClick={(e) => {
          e.preventDefault();
          window.location.reload();
        }}
        className="flex items-center gap-2"
      >
        <img src="/pgroid.png" alt="PG Avatar" className="h-8 w-8 rounded-lg" />
        <span className="font-medium">paulgraham.chat</span>
      </Link>
      {!isShared && messages.length > 0 && (
        <div className="fixed right-5">
          {/* Mobile version: circle with just icon */}
          <Button
            variant="ghost"
            size="icon"
            className="flex md:hidden items-center justify-center size-9 rounded-full border"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleShare();
            }}
          >
            <Share size={16} />
          </Button>

          {/* Desktop version: button with text */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex items-center gap-2 px-3 border"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleShare();
            }}
          >
            <Share size={16} />
            <span>Share</span>
          </Button>
        </div>
      )}
    </div>
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void append({ content: input, role: "user" });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const header = (
    <header className="m-auto flex max-w-96 flex-col gap-5 text-center">
      <div className="flex flex-col items-center justify-center">
        <img
          src="/pgroid.png"
          alt="PG Avatar"
          className="h-20 w-20 rounded-lg"
        />
      </div>
      <h1 className="text-2xl font-semibold leading-none tracking-tight">
        Ask PG
      </h1>
      <p className="text-muted-foreground text-sm">
        I'm an AI version of{" "}
        <a
          href="https://www.paulgraham.com/bio.html"
          className="text-foreground hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Paul Graham
        </a>
        , based on his{" "}
        <a
          href="https://www.paulgraham.com/articles.html"
          className="text-foreground hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          essays
        </a>
        .
      </p>
      <p className="text-muted-foreground text-sm">
        Ask me for startup, personal, or any other advice. I'll also reference
        the essays from which I derive my guidance.
      </p>
      <div className="flex justify-center mt-2">
        <a
          href="https://www.producthunt.com/posts/pg-chat?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-pg&#0045;chat"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=951146&theme=light&t=1744132356460"
            alt="PG&#0046;chat - Chat&#0032;with&#0032;AI&#0032;Paul&#0032;Graham&#0032;based&#0032;on&#0032;his&#0032;200&#0043;&#0032;essays | Product Hunt"
            style={{ width: "200px", height: "43px" }}
            width="200"
            height="43"
          />
        </a>
      </div>
      <div className="md:hidden justify-center flex">
        <Attribution />
      </div>
    </header>
  );

  const messageList = (
    <div className="my-4 flex h-fit min-h-full flex-col gap-0 pb-20">
      {messages.map((message, index) => {
        // Determine if previous message was from same role
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const isConsecutive = prevMessage && prevMessage.role === message.role;

        // Apply normal gap for first message or when role changes, smaller gap for consecutive
        const gapClass = isConsecutive ? "mt-1" : "mt-4";
        const isFirstMessage = index === 0;

        // Split assistant messages by double newlines
        if (
          message.role === "assistant" &&
          typeof message.content === "string"
        ) {
          // Check for citation format <file1|file2>
          const citationMatch = message.content.match(/<([^>]+)>$/);
          let messageContent = message.content;
          let citations: string[] = [];

          if (citationMatch) {
            // Extract citations and remove them from the displayed message
            citations = citationMatch[1].split("|");
            messageContent = message.content.replace(/<([^>]+)>$/, "").trim();
          }

          const parts = messageContent
            .split("\n\n")
            .filter((part) => part.trim() !== "");

          // If there are multiple parts, render each as a separate message
          if (parts.length > 1) {
            const messageElements = parts.map((part, partIndex) => (
              <div
                key={`${index}-${partIndex}`}
                data-role="assistant"
                className={`max-w-[80%] rounded-xl px-3 py-2 text-sm data-[role=assistant]:self-start data-[role=user]:self-end data-[role=assistant]:bg-gray-100 data-[role=user]:bg-blue-500 data-[role=assistant]:text-black data-[role=user]:text-white whitespace-pre-wrap ${partIndex === 0 ? (isFirstMessage ? "" : gapClass) : "mt-1"}`}
              >
                <MarkdownContent>{part}</MarkdownContent>
              </div>
            ));

            // Add citations after the last message part if they exist
            if (citations.length > 0) {
              messageElements.push(
                <div
                  key={`${index}-citations`}
                  className="flex flex-wrap gap-2 self-start ml-1 mt-1"
                >
                  {citations.map((citation, citationIndex) => {
                    // Remove .txt extension if present
                    const essayName = citation.replace(/\.txt$/, "");
                    return (
                      <CitationLink
                        key={`${index}-citation-${citationIndex}`}
                        essayName={essayName}
                      />
                    );
                  })}
                </div>,
              );
            }

            return messageElements;
          }

          // Single part message with possible citations
          return (
            <>
              <div
                key={index}
                data-role="assistant"
                className={`max-w-[80%] rounded-xl px-3 py-2 text-sm data-[role=assistant]:self-start data-[role=user]:self-end data-[role=assistant]:bg-gray-100 data-[role=user]:bg-blue-500 data-[role=assistant]:text-black data-[role=user]:text-white whitespace-pre-wrap ${isFirstMessage ? "" : gapClass}`}
              >
                <MarkdownContent>{messageContent}</MarkdownContent>
              </div>
              {citations.length > 0 && (
                <div className="flex flex-wrap gap-2 self-start ml-1 mt-1">
                  {citations.map((citation, citationIndex) => {
                    // Remove .txt extension if present
                    const essayName = citation.replace(/\.txt$/, "");
                    return (
                      <CitationLink
                        key={`${index}-citation-${citationIndex}`}
                        essayName={essayName}
                      />
                    );
                  })}
                </div>
              )}
            </>
          );
        }

        // Default rendering for user messages
        return (
          <div
            key={index}
            data-role={message.role}
            className={`max-w-[80%] rounded-xl px-3 py-2 text-sm data-[role=assistant]:self-start data-[role=user]:self-end data-[role=assistant]:bg-gray-100 data-[role=user]:bg-blue-500 data-[role=assistant]:text-black data-[role=user]:text-white whitespace-pre-wrap ${isFirstMessage ? "" : gapClass}`}
          >
            <MarkdownContent>{message.content}</MarkdownContent>
          </div>
        );
      })}
      {error && (
        <div
          data-role="assistant"
          className="max-w-[80%] rounded-xl px-3 py-2 text-sm data-[role=assistant]:self-start data-[role=user]:self-end data-[role=assistant]:bg-gray-100 data-[role=user]:bg-blue-500 data-[role=assistant]:text-black data-[role=user]:text-white whitespace-pre-wrap"
        >
          {(() => {
            try {
              const parsed = JSON.parse(error.message);
              return `Error: ${parsed.error}`;
            } catch {
              return `Error: ${error.message}`;
            }
          })()}
        </div>
      )}
    </div>
  );

  return (
    <main
      className={cn(
        "ring-none flex h-svh max-h-svh w-full flex-col items-stretch border-none",
        className,
      )}
      {...props}
    >
      <div className="mx-auto w-full max-w-[35rem]">{topHeader}</div>
      <div className="flex-1 overflow-y-auto">
        <div
          className={cn(
            "mx-auto w-full max-w-[35rem] px-6",
            !messages.length && "flex h-full items-center mt-[-25px]",
          )}
        >
          {messages.length ? messageList : header}
        </div>
      </div>
      {!isShared && (
        <div className="mx-auto w-full max-w-[35rem]">
          <form
            onSubmit={handleSubmit}
            className="border-input bg-background focus-within:ring-ring/10 relative mx-6 mb-6 flex items-center rounded-[16px] border px-3 py-1.5 pr-8 text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-0"
          >
            <AutoResizeTextarea
              onKeyDown={handleKeyDown}
              onChange={(v) => setInput(v)}
              value={input}
              placeholder="Enter a message"
              className="placeholder:text-muted-foreground flex-1 bg-transparent focus:outline-none"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute bottom-1 right-1 size-6 rounded-full"
                >
                  <ArrowUpIcon size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={12}>Submit</TooltipContent>
            </Tooltip>
          </form>
        </div>
      )}
      <div className="fixed bottom-4 right-4 z-50 hidden md:block">
        <Attribution />
      </div>

      <Dialog
        open={showShareDialog}
        onOpenChange={(open) => {
          setShowShareDialog(open);
          if (!open) {
            setShareUrl(null);
          }
        }}
      >
        <DialogContent className="max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle>Share public link to chat</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center border-2 rounded-full p-1">
              <input
                type="text"
                readOnly
                value={isGeneratingLink ? "Generating..." : shareUrl || ""}
                placeholder="https://paulgraham.chat/..."
                className={`flex-1 rounded-full px-3 py-2 text-sm focus:outline-none ${isGeneratingLink ? "text-neutral-400" : "text-neutral-900"} placeholder:text-neutral-400`}
              />
              {shareUrl ? (
                <Button
                  variant="default"
                  className="rounded-full gap-1"
                  size="sm"
                  onClick={handleCopy}
                  disabled={isGeneratingLink || copyButtonText === "Copied"}
                >
                  <Copy size={16} />
                  <span>{copyButtonText}</span>
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  className="rounded-full"
                  onClick={handleCreateLink}
                  disabled={isGeneratingLink}
                >
                  Create link
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
