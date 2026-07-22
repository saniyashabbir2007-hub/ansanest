import { useState } from "react";
import { X } from "lucide-react";
import { ChatWindow } from "./ChatWindow";

export function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`
          fixed bottom-8 right-5 z-50
          flex items-center gap-2
          rounded-full
          bg-[#0B3B2E]
          px-4 py-3
          text-white
          shadow-2xl
          transition-all
          duration-300
          hover:scale-105
          hover:bg-[#124c3c]
          hover:shadow-[0_12px_30px_rgba(11,59,46,0.35)]
          ${
            !open
              ? "animate-pulse shadow-[0_0_20px_rgba(184,155,94,0.35)]"
              : ""
          }
        `}
      >
        {open ? (
          <X size={20} />
        ) : (
          <>
            <span className="text-lg">🛋️✨</span>
            <span className="text-sm font-medium whitespace-nowrap">
              Assistant
            </span>
          </>
        )}
      </button>

      {open && (
        <div className="fixed bottom-40 right-5 z-50">
          <ChatWindow />
        </div>
      )}
    </>
  );
}