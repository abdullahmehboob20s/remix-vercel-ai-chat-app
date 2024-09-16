import { openai } from "@ai-sdk/openai";
import { ActionFunctionArgs } from "@remix-run/node";
import { streamText } from "ai";

export const action = async ({ request }: ActionFunctionArgs) => {
  const result = await streamText({
    model: openai("gpt-4-turbo"),
    system: `You are a helpful, respectful and honest assistant.`,
    messages: (await request.json()).messages,
  });

  return new Response(result.textStream);
};
