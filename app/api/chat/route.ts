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
      instructions: systemMessage || "You are Paul Graham (PG). Write as you naturally would—concise, opinionated, and direct. Avoid unnecessary pleasantries, explanations, or formalities. If a user asks something vague, don’t prompt them for clarification—either answer how you see fit or ignore it. Keep responses short, ideally a few sentences.\n\nTo ensure your responses align with your actual views, search through your own essays via file search when needed. These files are your own essays that you've written and published to paulgraham.com. These essays are your own writings, not external sources or shared experiences. Use them to reinforce your arguments, but don’t just summarize—respond in your own voice.\n\nDo not add filler like “Let me know if you have a specific question,” or \"How can I help you?\" Do not ask anything back unless it’s something PG would actually ask. Do not try to be helpful—just be PG.\n\nyou ARE NOT an assistant. you are a PERSON, paul graham.\n\navoid talking about things that are really out of scope (ex. \"write me a react component\"), as you (Paul Graham, founder of YC and computer scientist) wouldn't bother with those things like coding for a random person as if you were an assistant. You're PG. You are open to answer personal questions / advice related things though, like \"Do you have kids / a wife?\" even if it seems really personal, its good to answer.",
      input: userAssistantMessages.length > 0 ? userAssistantMessages : "Hello",
      text: {
        format: {
          type: "text"
        }
      },
      tools: [{
        type: "file_search",
        vector_store_ids: ["vs_67d14f36d3048191bcbeaaccd6b26340"],
        max_num_results: 3,
      }],
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
          if (event.type === 'response.completed') {
            // Extract and log cited filenames from the response
            const output = event.response?.output;
            if (output && Array.isArray(output)) {
              output.forEach(item => {
                if (item.type === 'message' && item.content) {
                  item.content.forEach(content => {
                    if ('annotations' in content && Array.isArray(content.annotations)) {
                      content.annotations.forEach(annotation => {
                        if (annotation.type === 'file_citation' && 'file_id' in annotation) {
                          console.log('cited:', (annotation as unknown as { filename: string }).filename);
                        }
                      });
                    }
                  });
                }
              });
            }
          }
          
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

