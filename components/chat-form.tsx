"use client"

import { cn } from "@/lib/utils"

import { useChat } from "ai/react"

import { ArrowUpIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AutoResizeTextarea } from "@/components/autoresize-textarea"
import { Attribution } from "@/components/attribution"

export function ChatForm({ className, ...props }: React.ComponentProps<"form">) {
  const { messages, input, setInput, append } = useChat({
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
    </header>
  )

  const messageList = (
    <div className="my-4 flex h-fit min-h-full flex-col gap-4">
      {messages.map((message, index) => {
        // Split assistant messages by double newlines
        if (message.role === 'assistant' && typeof message.content === 'string') {
          const parts = message.content.split('\n\n').filter(part => part.trim() !== '');
          
          // If there are multiple parts, render each as a separate message
          if (parts.length > 1) {
            return parts.map((part, partIndex) => (
              <div
                key={`${index}-${partIndex}`}
                data-role="assistant"
                className="max-w-[80%] rounded-xl px-3 py-2 text-sm data-[role=assistant]:self-start data-[role=user]:self-end data-[role=assistant]:bg-gray-100 data-[role=user]:bg-blue-500 data-[role=assistant]:text-black data-[role=user]:text-white whitespace-pre-wrap"
              >
                {part}
              </div>
            ));
          }
        }
        
        // Default rendering for user messages and assistant messages without splits
        return (
          <div
            key={index}
            data-role={message.role}
            className="max-w-[80%] rounded-xl px-3 py-2 text-sm data-[role=assistant]:self-start data-[role=user]:self-end data-[role=assistant]:bg-gray-100 data-[role=user]:bg-blue-500 data-[role=assistant]:text-black data-[role=user]:text-white whitespace-pre-wrap"
          >
            {message.content}
          </div>
        );
      })}
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
      <Attribution />
    </main>
  )
}

