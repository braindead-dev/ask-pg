import { type CoreMessage } from "ai";
import OpenAI from "openai";
import { AI_CONFIG } from "@/app/config/ai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json();

  // Convert messages to a format OpenAI can understand
  const inputMessages = messages.map((message) => ({
    role: message.role as "user" | "assistant" | "system",
    content: message.content as string,
  }));

  // We need to separate the system message if it exists
  let systemMessage: string | undefined;
  const userAssistantMessages = inputMessages.filter((msg) => {
    if (msg.role === "system") {
      systemMessage = msg.content;
      return false;
    }
    return true;
  });

  try {
    // Create stream response from OpenAI
    const responseStream = await openai.responses.create({
      model: AI_CONFIG.model,
      instructions: systemMessage || AI_CONFIG.defaultSystemPrompt,
      input: userAssistantMessages.length > 0 ? userAssistantMessages : "Hello",
      text: {
        format: {
          type: "text",
        },
      },
      tools: [
        {
          type: "file_search",
          vector_store_ids: [AI_CONFIG.fileSearch.vectorStoreId],
          max_num_results: AI_CONFIG.fileSearch.maxResults,
        },
      ],
      stream: true,
      store: AI_CONFIG.storeResponse,
    });

    // Set up server-sent events response
    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
      async start(controller) {
        // Generate a unique message ID in the format Vercel AI SDK expects
        const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

        // Send the first event with message ID (format event)
        controller.enqueue(encoder.encode(`f:{"messageId":"${messageId}"}\n`));

        // Process each event in the stream
        for await (const event of responseStream) {
          if (event.type === "response.completed") {
            // Extract cited filenames from the response
            const citedFiles: string[] = [];
            const output = event.response?.output;
            if (output && Array.isArray(output)) {
              output.forEach((item) => {
                if (item.type === "message" && item.content) {
                  item.content.forEach((content) => {
                    if (
                      "annotations" in content &&
                      Array.isArray(content.annotations)
                    ) {
                      content.annotations.forEach((annotation) => {
                        if (
                          annotation.type === "file_citation" &&
                          "file_id" in annotation
                        ) {
                          const filename = (
                            annotation as unknown as { filename: string }
                          ).filename;
                          console.log("cited:", filename);
                          // Add filename to the list if not already present
                          if (!citedFiles.includes(filename)) {
                            citedFiles.push(filename);
                          }
                        }
                      });
                    }
                  });
                }
              });
            }

            // If we have collected citations, append them to the final delta
            if (citedFiles.length > 0) {
              const citationsText = `\n\n<${citedFiles.join("|")}>`;
              controller.enqueue(
                encoder.encode(`0:${JSON.stringify(citationsText)}\n`),
              );
            }
          }

          if (event.type === "response.output_text.delta" && event.delta) {
            // Send delta as JSON string after the 0: prefix (with quotes)
            controller.enqueue(
              encoder.encode(`0:${JSON.stringify(event.delta)}\n`),
            );
          }
        }

        // Send the end event with metadata (end event)
        const endEvent = {
          finishReason: "stop",
          usage: {
            promptTokens: 0,
            completionTokens: 0,
          },
          isContinued: false,
        };
        controller.enqueue(encoder.encode(`e:${JSON.stringify(endEvent)}\n`));

        // Send a final data event with just usage info
        const finalEvent = {
          finishReason: "stop",
          usage: {
            promptTokens: 0,
            completionTokens: 0,
          },
        };
        controller.enqueue(encoder.encode(`d:${JSON.stringify(finalEvent)}\n`));

        controller.close();
      },
    });

    // Return the streamed response
    return new Response(customReadable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while generating the response",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
