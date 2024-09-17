import { CoreMessage } from "ai";
import { marked } from "marked";
import { useRef, useState } from "react";
import { processChatResponse } from "~/hooks/chat";

const ChatMessages = ({ messages }: { messages: CoreMessage[] }) => {
  return (
    <ul className="space-y-4 list-none pl-0">
      {messages.map((message, index) => {
        const htmlContent = marked(String(message.content));

        return (
          <li
            key={String(message.content) + index}
            className={`markdown bg-neutral-900 rounded w-fit py-1 px-4 text-white/80 border border-white/10 ${
              message.role === "user" ? "ml-auto" : ""
            }`}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        );
      })}
    </ul>
  );
};

function Index() {
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [question, setInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [isAiWriting, setIsAiWriting] = useState<boolean>(false);
  const mainElementRef = useRef<HTMLDivElement>(null);

  const resetInput = () => setInput("");

  const addMessage = (message: CoreMessage) =>
    setMessages((prevMessages) => [...prevMessages, message]);

  const askQuestion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsAiWriting(true);

    console.log("question = ", question);

    const messageNew: CoreMessage = { role: "user", content: question };
    const _msgs = [...messages, messageNew];

    addMessage(messageNew);
    resetInput();

    let response;
    try {
      response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ messages: _msgs }),
        headers: {
          "Content-Type": "text/event-stream",
        },
      });
    } catch (error) {
      console.log("error = ", error);
    }

    if (!response) return;

    const assistantMessageContent = await processChatResponse({
      response: response.body,
      onChunk: (data: string) => {
        setAnswer(data);
        if (mainElementRef.current) {
          mainElementRef.current.scrollTop =
            mainElementRef.current?.scrollHeight;
        }
      },
    });
    setAnswer("");
    addMessage({ role: "assistant", content: assistantMessageContent });
    setIsAiWriting(false);
  };

  return (
    <main className="absolute top-0 left-0 w-full h-screen flex flex-col">
      <header className="border-b h-16 border-white/20 flex-shrink-0 flex items-center px-6"></header>

      <div
        ref={mainElementRef}
        className="flex-1 p-5 bg-gray-900 overflow-auto"
      >
        <ChatMessages
          messages={[
            ...messages,
            { role: "assistant", content: answer } as CoreMessage,
          ].filter((m) => Boolean(m.content))}
        />
      </div>

      <footer className="h-16 border-t border-white/20 flex-shrink-0">
        <form
          onSubmit={askQuestion}
          className="h-full flex space-x-4 px-5 py-3"
        >
          <input
            value={question}
            onChange={(event) => setInput(event.target.value)}
            className="px-4 flex-1 rounded-md"
          />

          <button
            type="submit"
            disabled={isAiWriting}
            className="bg-blue-600 rounded-md px-6 disabled:opacity-80"
          >
            Ask
          </button>
        </form>
      </footer>
    </main>
  );
}

export default Index;
