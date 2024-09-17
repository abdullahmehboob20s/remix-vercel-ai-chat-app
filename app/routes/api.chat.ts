import { openai } from "@ai-sdk/openai";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { streamText } from "ai";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    // Handle preflight OPTIONS request
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const _a = (await request.json()).messages;

    // Initiating the text stream from the AI model
    const result = await streamText({
      model: openai("gpt-4-turbo"),
      system: `You are a helpful, respectful, and honest assistant.`,
      messages: _a,
    });

    // Creating a readable stream to handle the streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = result.textStream.getReader(); // Getting the reader for the stream

        try {
          // Reading chunks from the stream
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Directly enqueue the value as a string (since it's likely already text)
            controller.enqueue(
              typeof value === "string"
                ? value
                : new TextDecoder().decode(value)
            );
          }
        } catch (err) {
          controller.error(err); // Handle error if the stream fails
        } finally {
          controller.close(); // Close the stream when done
        }
      },
    });

    // Returning the response with the readable stream
    return new Response(stream, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "text/event-stream",
      },
    });
  } catch (error) {
    // Catching and returning the error in a JSON format
    return json({ error: error.message });
  }
};
