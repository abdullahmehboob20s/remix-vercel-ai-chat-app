import { openai } from "@ai-sdk/openai";
import { ActionFunctionArgs } from "@remix-run/node";
import { streamText } from "ai";

export const action = async ({ request }: ActionFunctionArgs) => {
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

  const result = await streamText({
    model: openai("gpt-4-turbo"),
    system: `You are a helpful, respectful and honest assistant.`,
    messages: (await request.json()).messages,
  });

  return new Response(result.textStream, {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
};
