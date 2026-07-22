import { useState } from "react";
import { X, Sofa } from "lucide-react";
import { ChatWindow } from "./ChatWindow";

export function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="group fixed bottom-7 right-6 z-50">
       <button
        onClick={() => setOpen((v) => !v)}
        className={`
          flex items-center justify-center
          rounded-full
          bg-white
          w-[56px] h-[56px]
          text-[#0B3B2E]
          border border-[#E7D8B6]
          shadow-md
          transition-all
          duration-200
          hover:scale-105 active:scale-95
hover:bg-[#145541]
          hover:shadow-xl
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
<span className="text-[26px] leading-none">🛋️</span>
        )}
      </button>
  
      <div
  className="
    absolute right-20 top-1/2 -translate-y-1/2
    opacity-0 group-hover:opacity-100
    transition-opacity duration-200
    pointer-events-none
    whitespace-nowrap
    rounded-xl
    bg-[#1C1C1C]
    px-4 py-2.5
    text-sm font-medium text-white
    shadow-lg
  "
>
  Furniture Expert
</div>
 </div>

      {open && (
        <div className="fixed bottom-7 right-6 z-50">
          <ChatWindow />
        </div>
      )}
    </>
  );
}