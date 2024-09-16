export const processChatResponse = async ({ response, onChunk }) => {
  let fullResponse = "";
  const decoder = new TextDecoder();

  for await (const chunk of response) {
    // Decode the Uint8Array (chunk) to a string
    const decodedChunk = decoder.decode(chunk, { stream: true });

    fullResponse += decodedChunk;

    // Call the onChunk function with the updated fullResponse
    onChunk(fullResponse);
  }

  return fullResponse;
};
