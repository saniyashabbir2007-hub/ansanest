import { useState } from "react";
import { askAssistant } from "@/lib/chat";
import { waLink } from "@/lib/business";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi 👋 I'm the ANSA NEST assistant. Ask me about our sofas, dimensions, materials, customization or delivery information.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const text = input.trim();

    const next = [
      ...messages,
      {
        role: "user" as const,
        content: text,
      },
    ];

    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await askAssistant(text, next);

      setMessages([
        ...next,
        {
          role: "assistant",
          content: res.answer,
        },
      ]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            "Sorry, something went wrong. Please try again later.",
        },
      ]);
    }

    setLoading(false);
  }

  const last =
    messages[messages.length - 1]?.content || "";

  const showWhatsapp =
    last.includes("I couldn't find enough information");

  return (
    <div className="flex h-[550px] w-[360px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
      <div className="bg-emerald p-4 text-white">
        <div className="font-semibold">
          ANSA NEST Assistant
        </div>
        <div className="text-sm text-white/80">
          Ask anything about our products.
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-xl p-3 text-sm ${
              m.role === "user"
                ? "ml-auto bg-emerald text-white"
                : "bg-muted"
            }`}
          >
            {m.content}
          </div>
        ))}

        {loading && (
          <div className="rounded-xl bg-muted p-3 text-sm">
            Thinking...
          </div>
        )}
      </div>

      {showWhatsapp && (
        <a
          href={waLink(
            "Hello ANSA NEST, I need more information."
          )}
          target="_blank"
          rel="noreferrer"
          className="mx-4 mb-3 rounded-md bg-[#25D366] px-4 py-3 text-center text-sm font-medium text-white"
        >
          Chat on WhatsApp
        </a>
      )}

      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Ask a question..."
            className="flex-1 rounded-md border border-border px-3 py-2 text-sm"
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            className="rounded-md bg-emerald px-4 text-white"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}