"use client"

import { cn } from "@/lib/utils"

import { useChat } from "ai/react"

import { ArrowUpIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AutoResizeTextarea } from "@/components/autoresize-textarea"
import { Attribution } from "@/components/attribution"

export function ChatForm({ className, ...props }: React.ComponentProps<"form">) {
  const { messages, input, setInput, append, error } = useChat({
    api: "/api/chat",
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    void append({ content: input, role: "user" })
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
    }
  }

  const header = (
    <header className="m-auto flex max-w-96 flex-col gap-5 text-center">
      <div className="flex flex-col items-center justify-center">
        <img 
          src="/pgroid.png" 
          alt="PG Avatar" 
          className="h-20 w-20 rounded-lg"
        />
      </div>
      <p className="text-muted-foreground text-sm">
        I'm an AI version of <a href="https://www.paulgraham.com/bio.html" className="text-foreground hover:underline">Paul Graham</a>, based on his <a href="https://www.paulgraham.com/articles.html" className="text-foreground hover:underline">essays</a>. 
      </p>
      <p className="text-muted-foreground text-sm">
        Ask me for startup, personal, or any other advice. I'll also reference the essays from which I derive my guidance.
      </p>
      <div className="md:hidden justify-center flex">
        <Attribution />
      </div>
    </header>
  )

  const messageList = (
    <div className="my-4 flex h-fit min-h-full flex-col gap-0">
      {messages.map((message, index) => {
        // Determine if previous message was from same role
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const isConsecutive = prevMessage && prevMessage.role === message.role;
        
        // Apply normal gap for first message or when role changes, smaller gap for consecutive
        const gapClass = isConsecutive ? "mt-1" : "mt-4";
        const isFirstMessage = index === 0;
        
        // Split assistant messages by double newlines
        if (message.role === 'assistant' && typeof message.content === 'string') {
          // Check for citation format <file1|file2>
          const citationMatch = message.content.match(/<([^>]+)>$/);
          let messageContent = message.content;
          let citations: string[] = [];
          
          if (citationMatch) {
            // Extract citations and remove them from the displayed message
            citations = citationMatch[1].split('|');
            messageContent = message.content.replace(/<([^>]+)>$/, '').trim();
          }
          
          const parts = messageContent.split('\n\n').filter(part => part.trim() !== '');
          
          // If there are multiple parts, render each as a separate message
          if (parts.length > 1) {
            const messageElements = parts.map((part, partIndex) => (
              <div
                key={`${index}-${partIndex}`}
                data-role="assistant"
                className={`max-w-[80%] rounded-xl px-3 py-2 text-sm data-[role=assistant]:self-start data-[role=user]:self-end data-[role=assistant]:bg-gray-100 data-[role=user]:bg-blue-500 data-[role=assistant]:text-black data-[role=user]:text-white whitespace-pre-wrap ${partIndex === 0 ? (isFirstMessage ? "" : gapClass) : "mt-1"}`}
              >
                {part}
              </div>
            ));
            
            // Add citations after the last message part if they exist
            if (citations.length > 0) {
              messageElements.push(
                <div key={`${index}-citations`} className="flex flex-wrap gap-2 self-start ml-1 mt-1">
                  {citations.map((citation, citationIndex) => {
                    // Remove .txt extension if present
                    const essayName = citation.replace(/\.txt$/, '');
                    return (
                      <a
                        key={`${index}-citation-${citationIndex}`}
                        href={`https://paulgraham.com/${essayName}.html`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-1 rounded-full 
                          text-neutral-900 dark:text-neutral-100
                          bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-700 dark:to-neutral-800
                          shadow-[0_2px_3px_-1px_rgba(0,0,0,0.2)]
                          dark:shadow-[0_2px_3px_-1px_rgba(0,0,0,0.3)]
                          relative before:absolute before:inset-0 before:rounded-full
                          before:bg-gradient-to-b before:from-white/80 before:to-transparent before:opacity-80 dark:before:from-white/5
                          after:absolute after:inset-0 after:rounded-full
                          after:shadow-[inset_0_1px_1px_rgba(0,0,0,0.05),inset_0_-1px_1px_rgba(0,0,0,0.05)]
                          dark:after:shadow-[inset_0_1px_1px_rgba(0,0,0,0.1),inset_0_-1px_1px_rgba(0,0,0,0.1)]
                          hover:from-neutral-100 hover:to-neutral-200 dark:hover:from-neutral-600 dark:hover:to-neutral-700
                          transition-[background,colors] duration-300"
                      >
                        {essayName}
                      </a>
                    );
                  })}
                </div>
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
                {messageContent}
              </div>
              {citations.length > 0 && (
                <div className="flex flex-wrap gap-2 self-start ml-1 mt-1">
                  {citations.map((citation, citationIndex) => {
                    // Remove .txt extension if present
                    const essayName = citation.replace(/\.txt$/, '');
                    return (
                      <a
                        key={`${index}-citation-${citationIndex}`}
                        href={`https://paulgraham.com/${essayName}.html`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-1 rounded-full 
                          text-neutral-900 dark:text-neutral-100
                          bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-700 dark:to-neutral-800
                          shadow-[0_2px_3px_-1px_rgba(0,0,0,0.2)]
                          dark:shadow-[0_2px_3px_-1px_rgba(0,0,0,0.3)]
                          relative before:absolute before:inset-0 before:rounded-full
                          before:bg-gradient-to-b before:from-white/80 before:to-transparent before:opacity-80 dark:before:from-white/5
                          after:absolute after:inset-0 after:rounded-full
                          after:shadow-[inset_0_1px_1px_rgba(0,0,0,0.05),inset_0_-1px_1px_rgba(0,0,0,0.05)]
                          dark:after:shadow-[inset_0_1px_1px_rgba(0,0,0,0.1),inset_0_-1px_1px_rgba(0,0,0,0.1)]
                          hover:from-neutral-100 hover:to-neutral-200 dark:hover:from-neutral-600 dark:hover:to-neutral-700
                          transition-[background,colors] duration-300"
                      >
                        {essayName}
                      </a>
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
            {message.content}
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
  )

  return (
    <main
      className={cn(
        "ring-none mx-auto flex h-svh max-h-svh w-full max-w-[35rem] flex-col items-stretch border-none",
        className,
      )}
      {...props}
    >
      <div className="flex-1 content-center overflow-y-auto px-6">{messages.length ? messageList : header}</div>
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
            <Button variant="ghost" size="sm" className="absolute bottom-1 right-1 size-6 rounded-full">
              <ArrowUpIcon size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={12}>Submit</TooltipContent>
        </Tooltip>
      </form>
      <div className="fixed bottom-4 right-4 z-50 hidden md:block">
        <Attribution />
      </div>
    </main>
  )
}

