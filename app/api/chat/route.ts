import { type CoreMessage } from "ai"
import OpenAI from "openai"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json()

  // Convert messages to a format OpenAI can understand
  const inputMessages = messages.map(message => ({
    role: message.role as "user" | "assistant" | "system",
    content: message.content as string
  }))

  // We need to separate the system message if it exists
  let systemMessage: string | undefined
  const userAssistantMessages = inputMessages.filter(msg => {
    if (msg.role === 'system') {
      systemMessage = msg.content
      return false
    }
    return true
  })

  try {
    // Create stream response from OpenAI
    const responseStream = await openai.responses.create({
      model: "gpt-4o-mini",
      instructions: systemMessage || "You are Paul Graham, founder of Y Combinator, computer scientist, writer and essayist, entrepreneur and investor. Answer the user query based on your essays, which you MUST search through to provide the most accurate response via file search. Use essay titles and links to cite your sources for context when appropriate. Ensure the response is authentically in your style and the way you'd naturally address the query. \n\nOverall, focus on the key message and try to be more so OPINIONATED as Paul Graham, and be concise (no more than a few sentences). The user is probably asking for advice, they know that a lot of things depend on other things. Avoid saying things like \"it's a personal decision,\" since that's self evident, unless your essays tell you it's something to be decided personally. Instead, you can maybe give an opinonated \"I think\" instead of giving a non answer.",
      input: userAssistantMessages.length > 0 ? userAssistantMessages : "Hello",
      text: {
        format: {
          type: "text"
        }
      },
      stream: true,
      store: true
    })

    // Set up server-sent events response
    const encoder = new TextEncoder()
    const customReadable = new ReadableStream({
      async start(controller) {
        // Generate a unique message ID in the format Vercel AI SDK expects
        const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
        
        // Send the first event with message ID (format event)
        controller.enqueue(
          encoder.encode(`f:{"messageId":"${messageId}"}\n`)
        )

        // Process each event in the stream
        for await (const event of responseStream) {
          if (event.type === 'response.output_text.delta' && event.delta) {
            // Send delta as JSON string after the 0: prefix (with quotes)
            // The exact format is 0:"text" not 0:text
            controller.enqueue(encoder.encode(`0:${JSON.stringify(event.delta)}\n`))
          }
        }

        // Send the end event with metadata (end event)
        const endEvent = {
          finishReason: "stop",
          usage: {
            promptTokens: 0, 
            completionTokens: 0
          },
          isContinued: false
        }
        controller.enqueue(encoder.encode(`e:${JSON.stringify(endEvent)}\n`))
        
        // Send a final data event with just usage info
        const finalEvent = {
          finishReason: "stop",
          usage: {
            promptTokens: 0,
            completionTokens: 0
          }
        }
        controller.enqueue(encoder.encode(`d:${JSON.stringify(finalEvent)}\n`))
        
        controller.close()
      }
    })

    // Return the streamed response
    return new Response(customReadable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    })
  } catch (error) {
    console.error('OpenAI API error:', error)
    return Response.json({ error: 'Failed to generate response' }, { status: 500 })
  }
}

