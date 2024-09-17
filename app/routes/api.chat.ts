import { openai } from "@ai-sdk/openai";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { streamText } from "ai";

export const action = async ({ request }: ActionFunctionArgs) => {
  // Handle preflight OPTIONS request
  try {
    const _a = (await request.json()).messages;

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    console.log("_a = ", _a);

    const result = await streamText({
      model: openai("gpt-4-turbo"),
      system: `You are a helpful, respectful and honest assistant.`,
      messages: _a,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    return json({ error });
  }
};
