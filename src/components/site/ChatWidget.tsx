import { useState } from "react";
import { X, Sofa } from "lucide-react";
import { ChatWindow } from "./ChatWindow";

export function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="group fixed bottom-8 right-5 z-50">
        </div><button
        onClick={() => setOpen((v) => !v)}
        className={`
          fixed bottom-8 right-5 z-50
          flex items-center justify-center
          rounded-full
          bg-[#F8F5EF]
          w-16 h-16
          text-[#0B3B2E]
          border border-[#D6C7A1]
          shadow- xl
          transition-all
          duration-300
          hover:scale-110
          hover:bg-[#124c3c]
          hover:shadow-[0_10px_30px_rgba(11,59,46,0.25)]
          ${
            !open
  ? "shadow-[0_6px_20px_rgba(11,59,46,0.18)]"
  : ""
          }
        `}
      >
        {open ? (
          <X size={20} />
        ) : (
            <Sofa size={28} strokeWidth={2} />
        )}
      </button>
      <div
  className="
    absolute right-20 top-1/2 -translate-y-1/2
    opacity-0 group-hover:opacity-100
    transition-opacity duration-200
    pointer-events-none
    whitespace-nowrap
    rounded-lg
    bg-[#0B3B2E]
    px-3 py-2
    text-sm text-white
    shadow-lg
  "
>
  Furniture Expert
</div>

      {open && (
        <div className="fixed bottom-40 right-5 z-50">
          <ChatWindow />
        </div>
      )}
    </>
  );
}